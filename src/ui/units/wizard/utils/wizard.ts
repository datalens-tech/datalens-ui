import {
    DEFAULT_BAR_EXTRA_SETTINGS,
    DEFAULT_DATETIME_FORMAT,
    DEFAULT_DATE_FORMAT,
    DEFAULT_DONUT_EXTRA_SETTINGS,
    DEFAULT_FLAT_TABLE_EXTRA_SETTINGS,
} from 'constants/misc';
import {
    AREA_VISUALIZATION,
    COLUMN_VISUALIZATION,
    GEOPOINT_VISUALIZATION,
    GEOPOINT_WITH_CLUSTER_VISUALIZATION,
    GEOPOLYGON_VISUALIZATION,
    HEATMAP_VISUALIZATION,
    LINE_VISUALIZATION,
    POLYLINE_VISUALIZATION,
    VISUALIZATION_IDS,
} from 'constants/visualizations';

import {I18n} from 'i18n';
import lodash from 'lodash';
import moment from 'moment';
import type {
    CommonSharedExtraSettings,
    Field,
    FilterField,
    PointSizeConfig,
    VisualizationLayerShared,
    VisualizationLayerType,
} from 'shared';
import {
    DATASET_FIELD_TYPES,
    DatasetFieldType,
    Feature,
    NavigatorModes,
    Operations,
    isDateField,
    resolveIntervalDate,
    resolveOperation,
    resolveRelativeDate,
} from 'shared';
import {v1 as uuidv1} from 'uuid';

import history from '../../../utils/history';
import Utils from '../../../utils/utils';
import {getPlaceholdersWithMergedSettings} from '../reducers/utils';
import type {ThresholdsValidationStatus} from '../typings';

import {getChartFiltersWithDisabledProp} from './filters';

const i18n = I18n.keyset('wizard');

type DefaultExtraSettings = Partial<CommonSharedExtraSettings>;

const getVisualizationConfig = (type: VisualizationLayerType) => {
    let visualization: VisualizationLayerShared['visualization'];

    switch (type) {
        case 'geopoint': {
            visualization = lodash.cloneDeep(GEOPOINT_VISUALIZATION);
            visualization.allowLayerFilters = true;
            break;
        }
        case 'geopolygon': {
            visualization = lodash.cloneDeep(GEOPOLYGON_VISUALIZATION);
            visualization.allowLayerFilters = true;
            break;
        }
        case 'heatmap': {
            visualization = lodash.cloneDeep(HEATMAP_VISUALIZATION);
            visualization.allowLayerFilters = true;
            break;
        }
        case 'polyline': {
            visualization = lodash.cloneDeep(POLYLINE_VISUALIZATION);
            visualization.allowLayerFilters = true;
            break;
        }
        case 'geopoint-with-cluster': {
            visualization = lodash.cloneDeep(GEOPOINT_WITH_CLUSTER_VISUALIZATION);
            visualization.allowLayerFilters = true;
            break;
        }
        case 'line': {
            //@ts-ignore
            visualization = lodash.cloneDeep(LINE_VISUALIZATION);
            visualization.placeholders[0].capacity = 2;

            break;
        }
        case 'column': {
            //@ts-ignore
            visualization = lodash.cloneDeep(COLUMN_VISUALIZATION);
            visualization.placeholders[0].capacity = 2;

            break;
        }
        case 'area': {
            //@ts-ignore
            visualization = lodash.cloneDeep(AREA_VISUALIZATION);
            visualization.placeholders[0].capacity = 2;

            break;
        }
    }

    return visualization;
};

const getDefaultCommonPlaceholders = () => ({
    commonPlaceholders: {
        colors: [],
        colorsConfig: {},
        filters: [],
        geopointsConfig: {} as PointSizeConfig,
        sort: [],
        labels: [],
        tooltips: [],
        shapes: [],
        shapesConfig: {},
    },
});

const getDefaultGeolayerSettings = (
    type: VisualizationLayerType,
    layersNames: Record<string, boolean> = {},
) => {
    let index = 1;
    let name;

    do {
        name = `${i18n('label_new-layer')} ${index}`;
        index = index + 1;
    } while (layersNames[name]);

    return {
        layerSettings: {
            type,
            id: uuidv1(),
            name,
            alpha: 80,
            valid: false,
        },
    };
};

export const createVisualizationLayer = (
    type: VisualizationLayerType,
    layersNames?: Record<string, boolean>,
): VisualizationLayerShared['visualization'] => {
    return {
        ...getVisualizationConfig(type),
        ...getDefaultCommonPlaceholders(),
        ...getDefaultGeolayerSettings(type, layersNames),
    };
};

export const updateVisualizationLayerType = (
    layer: VisualizationLayerShared['visualization'],
    newType: VisualizationLayerType,
) => {
    const transition = `${layer.layerSettings.type}-${newType}`;
    const config = getVisualizationConfig(newType);
    const layerSettings = {...layer.layerSettings};
    const commonPlaceholders = {...layer.commonPlaceholders};
    layerSettings.type = newType;

    if (
        [
            'geopoint-heatmap',
            'heatmap-geopoint',
            'geopoint-geopoint-with-cluster',
            'geopoint-with-cluster-geopoint',
            'heatmap-geopoint-with-cluster',
            'geopoint-with-cluster-heatmap',
        ].includes(transition)
    ) {
        config.placeholders[0].items = [...layer.placeholders[0].items];
    }

    if (['line', 'area', 'column'].includes(newType)) {
        config.placeholders = getPlaceholdersWithMergedSettings({
            oldPlaceholders: layer.placeholders || [],
            newPlaceholders: config.placeholders || [],
            oldVisualizationId: layer.id,
            selectedPlaceholders: {x: true},
        });
        config.placeholders[0].items = [...layer.placeholders[0].items];
        config.placeholders[1].items = [...layer.placeholders[1].items];
    }

    return {
        ...config,
        layerSettings,
        commonPlaceholders,
    };
};

export const convertVisualizationToGeolayer = (
    visualization: VisualizationLayerShared['visualization'],
): VisualizationLayerShared['visualization'] => {
    const type = visualization.id;
    const config = getVisualizationConfig(type);

    return {
        ...config,
        ...visualization,
        ...getDefaultCommonPlaceholders(),
        ...getDefaultGeolayerSettings(type),
    };
};

export const getUpdatedLayers = (
    layers: VisualizationLayerShared['visualization'][],
    updatedLayer: VisualizationLayerShared['visualization'],
) => {
    // Approved order of layers by type (descending z-index): geopoint - geopolygon - heatmap

    const newLayers = layers.filter(
        (layer) => layer.layerSettings.id !== updatedLayer.layerSettings.id,
    );

    switch (updatedLayer.layerSettings.type) {
        case 'geopolygon': {
            const index = layers.findIndex((layer) => layer.layerSettings.type === 'geopoint');

            if (index === -1) {
                newLayers.push(updatedLayer);
            } else {
                newLayers.splice(index, 0, updatedLayer);
            }

            break;
        }
        case 'heatmap': {
            let index = layers.findIndex((layer) => layer.layerSettings.type === 'geopolygon');
            if (index !== -1) {
                newLayers.splice(index, 0, updatedLayer);
                break;
            }

            index = layers.findIndex((layer) => layer.layerSettings.type === 'geopoint');

            if (index === -1) {
                newLayers.push(updatedLayer);
            } else {
                newLayers.splice(index === 0 ? 0 : index - 1, 0, updatedLayer);
            }

            break;
        }
        case 'polyline': {
            const index = layers.findIndex((layer) => layer.layerSettings.type === 'geopoint');

            if (index === -1) {
                newLayers.push(updatedLayer);
            } else {
                newLayers.splice(index, 0, updatedLayer);
            }
            break;
        }
        default: {
            newLayers.push(updatedLayer);
            break;
        }
    }

    return newLayers;
};

export function getParametersFields(parametersParamsPairs: string[][], dimensions: Field[]) {
    return parametersParamsPairs.reduce((acc: Field[], paramPair) => {
        const [key, value = ''] = paramPair;

        if (value.trim() === '') {
            return acc;
        }

        const parsedParameterValue = String(value);

        if (!parsedParameterValue) {
            return acc;
        }

        const foundItem = [...dimensions].find((item) => {
            return item.guid === key || item.title === key ? item : null;
        });

        if (!foundItem) {
            return acc;
        }

        const parameterFromDashboard: Field = {
            ...foundItem,
            unsaved: true,
            default_value: parsedParameterValue,
        };

        return [...acc, parameterFromDashboard];
    }, []);
}

export const findFieldInDatasetSection = ({
    datasetSectionFields,
    guidOrTitle,
}: {
    datasetSectionFields: Field[];
    guidOrTitle: string;
}) => {
    return datasetSectionFields.find((field) => {
        return field.guid === guidOrTitle || (field.fakeTitle || field.title) === guidOrTitle;
    });
};

export function getFiltersFields(
    paramsPairs: string[][],
    filters: FilterField[],
    fields: Field[],
): {filtersFields: Field[]; chartFilters: FilterField[]} {
    const filtersFields: Field[] = [];
    const groupedParams = paramsPairs.reduce<Record<string, string[]>>((acc, paramPair) => {
        const key = paramPair[0];
        const urlValue: string = paramPair[1];

        if (!(key in acc)) {
            acc[key] = [];
        }

        acc[key].push(urlValue);

        return acc;
    }, {});

    Object.entries(groupedParams).forEach(([key, values]) => {
        // Let's try to find the filtered field
        const foundItem = findFieldInDatasetSection({
            datasetSectionFields: fields,
            guidOrTitle: key,
        });

        // If this is not in the data, we ignore such a filter
        if (!foundItem) {
            return;
        }

        const isFilterAlreadyInChart = filters.find((filter) => filter.guid === foundItem.guid);
        const defaultOperation =
            isDateField(foundItem) && values.length === 1 ? Operations.EQ : undefined;

        values.forEach((urlValue) => {
            if (
                !urlValue &&
                isFilterAlreadyInChart &&
                Utils.isEnabledFeature(Feature.EmptySelector)
            ) {
                filtersFields.push({
                    ...foundItem,
                    unsaved: true,
                    filter: {
                        operation: {code: Operations.NO_SELECTED_VALUES},
                        value: [''],
                    },
                });
            } else if (urlValue === '') {
                return;
            }

            const parsedFiltersOperation = resolveOperation(urlValue, defaultOperation);
            if (!parsedFiltersOperation) {
                return;
            }

            const code = parsedFiltersOperation.operation;
            const value: string[] = [parsedFiltersOperation.value];

            // Let's try to find such a filter among the parameters created from search
            const foundFilter = filtersFields.find((item) => {
                return item.guid === key || item.title === key;
            });

            // If such a filter is found, then we do not create a new one, but supplement the old one, but only if the operator supports multi-selection
            if (foundFilter && (code === Operations.IN || code === Operations.NIN)) {
                foundFilter.filter!.value = [...foundFilter.filter!.value, ...value];
            } else {
                filtersFields.push({
                    ...foundItem,
                    unsaved: true,
                    filter: {
                        operation: {
                            code,
                        },
                        value,
                    },
                });
            }
        });
    });

    const chartFilters = getChartFiltersWithDisabledProp({
        dashboardFilters: filtersFields,
        chartFilters: filters,
    });

    return {filtersFields, chartFilters};
}

export function getDefaultVisualisationExtraSettings(
    visualisationId: string,
): DefaultExtraSettings | null {
    switch (visualisationId) {
        case VISUALIZATION_IDS.FLAT_TABLE:
            return DEFAULT_FLAT_TABLE_EXTRA_SETTINGS;
        case VISUALIZATION_IDS.DONUT:
            return DEFAULT_DONUT_EXTRA_SETTINGS;
        case VISUALIZATION_IDS.COLUMN:
        case VISUALIZATION_IDS.BAR:
            return DEFAULT_BAR_EXTRA_SETTINGS;
        default:
            return null;
    }
}

export const getDefaultExtraSettings = (
    visualisationId: string,
    prevExtraSettings?: CommonSharedExtraSettings,
): DefaultExtraSettings => {
    let defaultExtraSettings = getDefaultVisualisationExtraSettings(visualisationId) || {};

    if (prevExtraSettings) {
        const navigatorSettings = prevExtraSettings.navigatorSettings;
        const navigatorMode = prevExtraSettings.navigatorMode;

        if (navigatorSettings && navigatorSettings.navigatorMode === NavigatorModes.Show) {
            defaultExtraSettings = {
                ...defaultExtraSettings,
                navigatorSettings,
            };
        } else if (navigatorMode && navigatorMode === NavigatorModes.Show) {
            defaultExtraSettings = {
                ...defaultExtraSettings,
                navigatorMode,
                navigatorSeriesName: prevExtraSettings?.navigatorSeriesName,
            };
        }
    }

    return defaultExtraSettings;
};

export const isFieldVisible = (field: Field) =>
    !(field.quickFormula || field.hidden || field.virtual);

export const isFieldPseudo = (field: Field) => field.type === DatasetFieldType.Pseudo;

export const getFieldFormat = (field: Field) => {
    let format = field.format;
    if (!format) {
        format =
            field.data_type === DATASET_FIELD_TYPES.DATE
                ? DEFAULT_DATE_FORMAT
                : DEFAULT_DATETIME_FORMAT;
    }

    return format;
};

function resolveDateValue(value: string) {
    if (/^__relative/.test(value)) {
        return [resolveRelativeDate(value)];
    }

    if (/^__interval/.test(value)) {
        const resolvedValue = resolveIntervalDate(value);
        return [resolvedValue?.from, resolvedValue?.to];
    }

    return null;
}

export const parseFilterDate = (item: Field): string => {
    const {filter} = item;
    const format = getFieldFormat(item);
    const dateValue = filter?.value[0];

    if (!dateValue) {
        return '';
    }

    const resolved = resolveDateValue(dateValue);
    if (!resolved) {
        return moment(dateValue).utc().format(format);
    }

    const [from, to] = resolved;
    if (filter.operation.code === Operations.BETWEEN) {
        return `${moment(from).utc().format(format)}-${moment(to).utc().format(format)}`;
    }
    return moment(from).utc().format(format);
};

export const parseParameterDefaultValue = (item: Field): string => {
    const format = getFieldFormat(item);
    const defaultValue = String(item.default_value);

    if (isDateField(item)) {
        const resolved = resolveDateValue(defaultValue);
        if (resolved) {
            return resolved.map((dateValue) => moment(dateValue).format(format)).join('-');
        }
    }

    return defaultValue;
};

export const removeUrlParameter = (key: string) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete(key);

    history.replace({
        pathname: location.pathname,
        search: searchParams.toString(),
    });
};

type UpdateUrlParameter = {
    key: string;
    value: string;
};

export const updateUrlParameter = ({key, value}: UpdateUrlParameter) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set(key, value);

    history.replace({
        pathname: location.pathname,
        search: searchParams.toString(),
    });
};

export const removeUrlParameters = (keys: string[]) => {
    keys.forEach(removeUrlParameter);
};

export const getExistedParameterKeys = (args: {possibleKeys: string[]}) => {
    const searchParams = new URLSearchParams(window.location.search);
    return args.possibleKeys.filter((key) => searchParams.get(key) !== null);
};

type AppendUrlParameterArgs = {
    key: string;
    values: string[];
};

export const appendUrlParameters = ({key, values}: AppendUrlParameterArgs) => {
    const searchParams = new URLSearchParams(window.location.search);

    values.forEach((value) => {
        searchParams.append(key, value);
    });

    history.replace({
        pathname: location.pathname,
        search: searchParams.toString(),
    });
};

export const validateThresholds = (args: {
    leftThreshold: string | undefined;
    middleThreshold: string | undefined;
    rightThreshold: string | undefined;
    pointsToValidate: '2-point' | '3-point';
}) => {
    const {pointsToValidate, leftThreshold, middleThreshold, rightThreshold} = args;

    const left = Number(leftThreshold);
    const middle = Number(middleThreshold);
    const right = Number(rightThreshold);

    const typeLeft = typeof left !== 'number' || isNaN(left);
    const typeRight = typeof right !== 'number' || isNaN(right);
    const typeMiddle = typeof middle !== 'number' || isNaN(middle);

    let result: ThresholdsValidationStatus | undefined;

    if (pointsToValidate === '2-point') {
        if (typeLeft || typeRight) {
            result = {};

            if (typeLeft) {
                result.left = {text: i18n('label_enter-number')};
            }

            if (typeRight) {
                result.right = {text: i18n('label_enter-number')};
            }

            return result;
        }

        if (left > right) {
            result = {
                left: {
                    text: i18n('label_should-be-less-than-right'),
                },
            };
        }

        return result;
    } else {
        if (typeLeft || typeMiddle || typeRight) {
            result = {};

            if (typeLeft) {
                result.left = {text: i18n('label_enter-number')};
            }

            if (typeMiddle) {
                result.middle = {text: i18n('label_enter-number')};
            }

            if (typeRight) {
                result.right = {text: i18n('label_enter-number')};
            }

            return result;
        }

        if (left > right) {
            result = {};
            result.left = {
                text: i18n('label_should-be-less-than-right'),
            };
        }

        if (middle > right) {
            result = result || {};
            result.middle = {
                text: i18n('label_should-be-less-than-right'),
            };
        }

        if (left > middle) {
            result = result || {};
            result.left = {
                text: i18n('label_should-be-less-than-middle'),
            };
        }

        return result;
    }
};
