import {GEOLAYER_VISUALIZATION} from 'constants/visualizations';

import {I18n} from 'i18n';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';
import type {
    ColorsConfig,
    Dataset,
    DatasetApiError,
    DatasetField,
    ExtendedChartsConfig,
    Field,
    FilterField,
    HierarchyField,
    Link,
    ObligatoryFilter,
    Placeholder,
    PlaceholderId,
    PointSizeConfig,
    RawUpdate,
    Shared,
    Sort,
    Update,
    UpdateField,
    VisualizationLayerShared,
    VisualizationLayerType,
    VisualizationWithLayersShared,
    WorkbookId,
} from 'shared';
import {
    DATASET_FIELD_TYPES,
    DatasetFieldAggregation,
    DatasetFieldType,
    ENTRY_TYPES,
    TIMEOUT_95_SEC,
    WizardVisualizationId,
    createMeasureNames,
    filterUpdatesByDatasetId,
    getResultSchemaFromDataset,
    isMeasureName,
    isMeasureValue,
    isParameter,
    isVisualizationWithLayers,
    mapChartsConfigToLatestVersion,
    prepareUrlParams,
    splitParamsToParametersAndFilters,
} from 'shared';
import type {DataLensApiError} from 'typings';
import type {DatalensGlobalState} from 'ui';
import {navigateHelper} from 'ui/libs';
import {
    getAvailableVisualizations,
    getDefaultVisualization,
} from 'ui/units/wizard/utils/visualization';
import history from 'ui/utils/history';
import type {DatasetState} from 'units/wizard/reducers/dataset';
import {selectDataset, selectDatasets} from 'units/wizard/selectors/dataset';
import {v1 as uuidv1} from 'uuid';

import {WIZARD_DATASET_ID_PARAMETER_KEY} from '../../../constants/misc';
import type {ChartKitCustomError} from '../../../libs/DatalensChartkit/ChartKit/modules/chartkit-custom-error/chartkit-custom-error';
import logger from '../../../libs/logger';
import {getSdk} from '../../../libs/schematic-sdk';
import {sdk as oldSdk} from '../../../libs/sdk';
import {showToast} from '../../../store/actions/toaster';
import {getFilteredObject} from '../../../utils';
import type {WizardDispatch, WizardGlobalState} from '../reducers';
import {selectWizardWorkbookId} from '../selectors/settings';
import {selectVisualization} from '../selectors/visualization';
import {filterVisualizationColors} from '../utils/colors';
import {getChartFiltersWithDisabledProp} from '../utils/filters';
import {getVisualization, transformSchema} from '../utils/helpers';
import {
    mapChartsConfigToClientConfig,
    selectChartsConfigUpdates,
} from '../utils/mappers/mapChartsToClientConfig';
import {
    convertVisualizationToGeolayer,
    getFiltersFields,
    getParametersFields,
    getUpdatedLayers,
    updateVisualizationLayerType,
} from '../utils/wizard';

import {
    setDataset,
    setDatasetApiErrors,
    setDatasetLoading,
    setDatasetSchema,
    setDatasets,
    setHierarchies,
    setLinks,
    setOriginalDatasets,
} from './dataset';
import {actualizeAndSetUpdates, setUpdates, updatePreviewAndClientChartsConfig} from './preview';
import {setDefaultsSet, setRouteWorkbookId, toggleNavigation} from './settings';
import {getDatasetUpdates, isSharedPlaceholder, mutateAndValidateItem} from './utils';
import {
    _setSelectedLayerId,
    _setVisualization,
    _setVisualizationPlaceholderItems,
    setColors,
    setColorsConfig,
    setDashboardParameters,
    setFilters,
    setLabels,
    setLayerFilters,
    setPointsSizeConfig,
    setSegments,
    setShapes,
    setShapesConfig,
    setSort,
    setTooltips,
    updateLayers,
} from './visualization';
import {
    forceEnablePivotFallback,
    receiveWidgetAndPrepareMetadata,
    setExtraSettings,
    setWidgetLoadStatus,
} from './widget';

const i18n = I18n.keyset('wizard');

export const RESET_WIZARD_STORE = Symbol('wizard/RESET_WIZARD_STORE');
export const SET_WIZARD_STORE = Symbol('wizard/SET_WIZARD_STORE');

type ApplyLocalFieldsArgs = {
    dataset: Dataset;
    localFields: Field[];
};

export function applyLocalFields({dataset, localFields}: ApplyLocalFieldsArgs) {
    const schema = getResultSchemaFromDataset(dataset);

    schema.push(...localFields);

    delete dataset.raw_schema;
}

type PrepareDatasetArgs = {
    dataset: Dataset;
    widgetDataset?: Dataset;
};

export function prepareDataset({dataset, widgetDataset}: PrepareDatasetArgs) {
    const {options} = dataset;
    const schema = getResultSchemaFromDataset(dataset);

    const widgetSchema = getResultSchemaFromDataset(widgetDataset);

    const localFields = widgetSchema.filter((field) => field.local);

    applyLocalFields({dataset, localFields});

    const {dimensions, measures} = transformSchema({schema, widgetDataset, dataset});

    return {dataset, measures, dimensions, options};
}

type GetDatasetArgs = {
    id: string;
    workbookId: WorkbookId;
};

function getDataset({id, workbookId}: GetDatasetArgs) {
    return getSdk()
        .bi.getDatasetByVersion({
            datasetId: id,
            workbookId,
            version: 'draft',
        })
        .then((dataset) => {
            if (dataset && dataset.key) {
                const keyParts = dataset.key.split('/');
                dataset.realName = keyParts[keyParts.length - 1];
            }

            if (dataset.result_schema) {
                delete dataset.result_schema;
            }

            return dataset;
        });
}

type GetDatasetsArgs = {
    datasetsIds: string[];
    workbookId: WorkbookId;
};

export async function getDatasets({datasetsIds, workbookId}: GetDatasetsArgs) {
    const errors: DatasetApiError[] = [];

    const items = await Promise.all(
        datasetsIds.map(async (datasetId) => {
            try {
                return await getDataset({id: datasetId, workbookId});
            } catch (error) {
                errors.push({datasetId, error});
                return null;
            }
        }),
    );

    return {
        datasets: items.filter(Boolean) as Dataset[],
        errors,
    };
}

type FetchDatasetArgs = {
    id: string;
    replacing?: boolean;
};

export function fetchDataset({id, replacing}: FetchDatasetArgs) {
    return async function (dispatch: WizardDispatch, getState: () => DatalensGlobalState) {
        const datasetState = getState().wizard.dataset;
        const originalDatasets = datasetState.originalDatasets;
        if (!getState().wizard.visualization.visualization) {
            dispatch(processCurrentWidgetWithDatasets({datasetsIds: [id]}));

            return Promise.resolve();
        }

        dispatch(setDatasetLoading({loading: true}));

        const workbookId = selectWizardWorkbookId(getState());

        return getDataset({id, workbookId})
            .then(async (dataset: Dataset) => {
                dispatch(setDataset({dataset}));

                const updatedOriginalDatasets = {
                    ...originalDatasets,
                    [id]: dataset,
                };
                dispatch(setOriginalDatasets({originalDatasets: updatedOriginalDatasets}));

                const {
                    dataset: {datasets, dimensions, measures} = {
                        datasets: [],
                        dimensions: [],
                        measures: [],
                    },
                } = getState().wizard;

                const defaultFilters = getDefaultFilters(
                    dataset.dataset.obligatory_filters,
                    dimensions,
                    measures,
                );

                const {visualization: {filters: currentFilters = []} = {}} = getState().wizard;

                const defaultFiltersMap = defaultFilters.reduce(
                    (acc, defaultFilter) => {
                        acc[defaultFilter.guid] = defaultFilter.filter;
                        return acc;
                    },
                    {} as Record<string, FilterField['filter']>,
                );

                const updatedFilters = currentFilters.filter((filter) => {
                    if (defaultFiltersMap[filter.guid]) {
                        const currentFilterValues = filter.filter.value as string | string[];
                        const defaultFilterValues = defaultFiltersMap[filter.guid].value;

                        if (
                            typeof defaultFilterValues === 'string' &&
                            typeof currentFilterValues === 'string'
                        ) {
                            return defaultFilterValues !== currentFilterValues;
                        } else if (
                            Array.isArray(defaultFilterValues) &&
                            Array.isArray(currentFilterValues)
                        ) {
                            return !isEqual(defaultFilterValues.sort(), currentFilterValues.sort());
                        }

                        return false;
                    }

                    return true;
                });

                dispatch(setFilters({filters: updatedFilters.concat(defaultFilters)}));

                // when replacing a dataset, there is no need to update the settings
                if (replacing !== true && datasets.length > 1) {
                    dispatch(forceEnablePivotFallback());
                }

                const updates = getState().wizard.preview.updates;

                dispatch(actualizeAndSetUpdates({updates}));

                const preview: {needRedraw?: boolean} = {};
                if (typeof replacing !== 'undefined') {
                    preview.needRedraw = !replacing;
                }

                dispatch(updatePreviewAndClientChartsConfig(preview));
            })
            .catch((error: DataLensApiError) => {
                logger.logError('wizard: fetchDataset failed', error as Error);
                dispatch(
                    setDataset({
                        error,
                        dataset: {
                            id,
                        } as Dataset,
                    }),
                );
            });
    };
}

function getDefaultFilters(
    obligatoryFilters: ObligatoryFilter[],
    dimensions: Field[],
    measures: Field[],
): FilterField[] {
    const dict = [...dimensions, ...measures].reduce((acc: Record<string, Field>, item) => {
        acc[item.guid] = item;
        return acc;
    }, {});

    return obligatoryFilters.reduce((acc: FilterField[], obligatoryFilter: ObligatoryFilter) => {
        acc = acc.concat(
            obligatoryFilter.default_filters
                .filter((item) => dict[item.column])
                .map(
                    (item) =>
                        ({
                            ...dict[item.column],
                            filter: {
                                value: item.values,
                                operation: {
                                    code: item.operation,
                                },
                            },
                            is_default_filter: true,
                        }) as unknown as FilterField,
                ),
        );

        return acc;
    }, []);
}

export function setCurrentDataset({dataset}: {dataset: Dataset}) {
    return function (dispatch: WizardDispatch) {
        dispatch(setDataset({dataset}));
    };
}

type SetVisualizationPlaceholderItemsArgs = {
    visualization: Shared['visualization'];
    placeholder: Placeholder;
    items: Field[];
    onDone?: () => void;
};

export function setVisualizationPlaceholderItems({
    visualization,
    placeholder,
    items,
    onDone,
}: SetVisualizationPlaceholderItemsArgs) {
    return (dispatch: WizardDispatch, getState: () => DatalensGlobalState) => {
        const {sort} = getState().wizard.visualization;
        const stateVisualization = getState().wizard.visualization.visualization!;
        let {colors, shapes} = getState().wizard.visualization;

        let atLeastOneHierarchyExists = false;

        placeholder.items = items.map((item) => {
            if (item.data_type === DATASET_FIELD_TYPES.HIERARCHY) {
                if (atLeastOneHierarchyExists) {
                    return {
                        ...item,
                        valid: false,
                        conflict: 'more-than-one-hierarchy',
                    };
                }

                atLeastOneHierarchyExists = true;

                return {
                    ...item,
                    valid: true,
                    conflict: undefined,
                };
            }

            return item;
        });

        if (placeholder.onChange) {
            // placeholder.onChange mutates objects passed to it
            // colors is updated to trigger redrawing.
            placeholder.onChange({
                placeholder,
                visualization,
                colors,
                shapes,
                sort,
                placeholderId: placeholder.id as PlaceholderId,
            });
            colors = [...colors];
            shapes = [...shapes];
        }

        let updatedVisualization;

        if (isVisualizationWithLayers(stateVisualization)) {
            updatedVisualization = {
                ...stateVisualization,
                layers: stateVisualization.layers.map((layer) => {
                    if (
                        layer.layerSettings.id ===
                        (visualization as VisualizationLayerShared['visualization']).layerSettings
                            .id
                    ) {
                        return {
                            ...visualization,
                            placeholders: visualization.placeholders.map((p: Placeholder) => {
                                if (p.id === placeholder.id) {
                                    return placeholder;
                                }

                                return p;
                            }),
                        };
                    }

                    const visualizationId = stateVisualization.id as WizardVisualizationId;
                    if (isSharedPlaceholder(placeholder.id as PlaceholderId, visualizationId)) {
                        layer.placeholders = layer.placeholders.map((p) => {
                            if (p.id === 'x') {
                                return {
                                    ...p,
                                    items: [...placeholder.items],
                                };
                            }

                            return p;
                        });
                    }

                    return layer;
                }),
            };
        } else {
            updatedVisualization = {
                ...stateVisualization,
                placeholders: stateVisualization.placeholders.map((p: Placeholder) => {
                    if (p.id === placeholder.id) {
                        return placeholder;
                    }

                    return p;
                }),
            };
        }

        dispatch(
            _setVisualizationPlaceholderItems({
                visualization: updatedVisualization as Shared['visualization'],
                colors,
                shapes,
            }),
        );

        if (onDone) {
            onDone();
        }
    };
}

function getSameTitleInNewDataset(
    field: {guid?: string; title?: string} | undefined,
    datasetSchema: Field[],
) {
    if (!field) {
        return undefined;
    }

    return datasetSchema.find((newItem) => {
        return newItem.title === field.title || newItem.guid === field.guid;
    }) as Field | undefined;
}

export function removeDataset({
    datasetId,
    newDataset,
    needUpdate = true,
}: {
    datasetId: string;
    newDataset?: Dataset;
    needUpdate?: boolean;
}) {
    return async function (dispatch: WizardDispatch, getState: () => DatalensGlobalState) {
        const {
            dataset: {dataset: currentDataset, datasets = [], links = []} = {},
            visualization: {visualization, hierarchies},
            preview,
        } = getState().wizard;

        let {
            visualization: {filters, colors, sort, labels, tooltips},
        } = getState().wizard;

        // Deleting the dataset
        const datasetIndex = datasets.findIndex((someDataset) => someDataset.id === datasetId);
        let prevDatasetFields: DatasetField[] = [];

        if (datasetIndex !== -1) {
            prevDatasetFields = datasets[datasetIndex]?.dataset?.result_schema || [];
            datasets.splice(datasetIndex, 1);
        }

        // If you have deleted the current dataset, we put the first one from the list of remaining ones as the current one
        if (datasetId === currentDataset?.id) {
            dispatch(
                setCurrentDataset({
                    dataset: datasets[0],
                }),
            );
        }

        // We delete the links associated with the deleted dataset
        const linksWithoutThisDataset = links.filter((link) => {
            return !link.fields[datasetId];
        });

        dispatch(
            setLinks({
                links: linksWithoutThisDataset,
            }),
        );

        // Updating the list of datasets
        dispatch(
            setDatasets({
                datasets,
            }),
        );

        const datasetFields = newDataset?.dataset?.result_schema || [];
        const updates = (preview.updates || []).map((update) => {
            const field = {...update.field};
            if (field.datasetId === datasetId && field.quickFormula) {
                const originalField = datasetFields.find(
                    (datasetField) =>
                        datasetField.title === field.originalTitle &&
                        datasetField.aggregation === 'none',
                );

                if (originalField) {
                    field.avatar_id = originalField.avatar_id;
                    field.source = originalField.source;
                }
            }

            return {...update, field};
        });

        let datasetSchema: Field[] = [];
        if (newDataset) {
            const dataset =
                (await dispatch(
                    getDatasetWithLocalFields({
                        dataset: newDataset,
                        updates,
                        datasetId,
                    }),
                )) || undefined;
            datasetSchema = getResultSchemaFromDataset(dataset);
        }

        const mapItem = <T extends Field>(item: T) => {
            // Here we validate each field after deleting/replacing the dataset
            // It makes sense to validate only those fields that relate to the deleted or new dataset.
            if (item.datasetId === datasetId || item.datasetId === newDataset?.id) {
                if (newDataset) {
                    const sameTitleInNewDataset = getSameTitleInNewDataset(item, datasetSchema);

                    if (sameTitleInNewDataset) {
                        let resultField = {
                            ...sameTitleInNewDataset,
                        };

                        // If there was a datasetId value in the previous field, then you need to put it in the field with which we replace it
                        if (item.datasetId) {
                            resultField = {
                                ...resultField,
                                datasetId: newDataset.id,
                            };
                        }

                        const fieldSettings: (keyof Field)[] = [
                            'filter',
                            'fakeTitle',
                            'formatting',
                            'columnSettings',
                            'barsSettings',
                            'hintSettings',
                        ];

                        if (item.filter) {
                            fieldSettings.push('unsaved', 'disabled');
                        }

                        fieldSettings.forEach((fieldSettingName) => {
                            if (item[fieldSettingName]) {
                                resultField = {
                                    ...resultField,
                                    [fieldSettingName]: item[fieldSettingName],
                                };
                            }
                        });

                        if (item.backgroundSettings) {
                            const backgroundSettings = {...item.backgroundSettings};
                            const prevField = prevDatasetFields.find(
                                (datasetField) =>
                                    datasetField.guid === backgroundSettings.colorFieldGuid,
                            );
                            const newColorField = getSameTitleInNewDataset(
                                prevField,
                                datasetSchema,
                            );

                            if (newColorField) {
                                backgroundSettings.colorFieldGuid = newColorField?.guid;

                                resultField = {
                                    ...resultField,
                                    backgroundSettings: {
                                        ...backgroundSettings,
                                        colorFieldGuid: newColorField.guid,
                                    },
                                };
                            }
                        }

                        // Here we return the field that we need to replace an existing one with
                        // Since the dataset was replaced
                        return resultField;
                    }
                }

                item.conflict = 'not-existing';
            }

            return item;
        };

        const visualizationLayers = isVisualizationWithLayers(visualization)
            ? visualization.layers || []
            : [visualization];

        visualizationLayers.forEach((layer) => {
            layer?.placeholders.forEach((placeholder) => {
                placeholder.items = placeholder.items.map(mapItem);

                dispatch(
                    setVisualizationPlaceholderItems({
                        visualization: layer as Shared['visualization'],
                        placeholder,
                        items: placeholder.items,
                    }),
                );
            });
        });

        const mappedHierarchies = hierarchies.map((hierarchy) => ({
            ...hierarchy,
            fields: hierarchy.fields.map(mapItem),
        }));
        dispatch(setHierarchies({hierarchies: mappedHierarchies}));

        // Set filters
        filters = filters
            .filter(
                (item) =>
                    !item.is_default_filter ||
                    (item.is_default_filter && item.datasetId !== datasetId),
            )
            .map((item) => mapItem(item as unknown as Field)) as unknown as FilterField[];
        dispatch(
            setFilters({
                filters,
            }),
        );

        // Set divisions by colors
        colors = colors.map(mapItem);
        dispatch(
            setColors({
                colors,
            }),
        );

        // Set the sorting
        sort = sort.map(mapItem) as Sort[];
        dispatch(
            setSort({
                sort,
            }),
        );

        // Set signatures
        labels = labels.map(mapItem);
        dispatch(
            setLabels({
                labels,
            }),
        );

        // Set tooltips
        tooltips = tooltips.map(mapItem);
        dispatch(
            setTooltips({
                tooltips,
            }),
        );

        if (newDataset) {
            await dispatch(
                updateDatasetByValidation({
                    dataset: newDataset,
                    updates,
                    needUpdate,
                }),
            );
        } else {
            dispatch(updatePreviewAndClientChartsConfig({}));
        }
    };
}

interface ValidateAndUpdatePivotTableFields {
    colors: Field[];
    visualization: Shared['visualization'];
}

export function validatedAndUpdatePivotTableFields({
    colors,
    visualization,
}: ValidateAndUpdatePivotTableFields) {
    // In the old pivot tables, it was possible to put Measure Names in colors, but they did not affect the graph in any way.
    // The summaries from the backend are not ready for them, so we filter the colors.
    const updatedColors = colors.filter((c) => !isMeasureName(c));

    // In the old pivot tables, it was possible to put Measure Values in rows, while it behaves like Measure Names.
    // Therefore, we are looking for and replacing an invalid field in the user's config.
    const visualizationCopy: Shared['visualization'] = {...visualization};
    const placeholders = visualizationCopy.placeholders;

    const rows = placeholders.find((placeholder) => placeholder.id === 'rows');

    if (rows) {
        const rowsFields: Field[] = rows.items;

        const updatedPlaceholderItems = rowsFields.map((field) => {
            if (isMeasureValue(field)) {
                return createMeasureNames();
            }

            return field;
        });

        visualizationCopy.placeholders = placeholders.map((placeholder: Placeholder) => {
            if (placeholder.id === 'rows') {
                return {
                    ...placeholder,
                    items: updatedPlaceholderItems,
                };
            }

            return placeholder;
        });
    }

    return {updatedColors, updatedVisualization: visualizationCopy};
}

interface PrivateReceiveVisualizationArgs {
    visualization: Shared['visualization'] | VisualizationWithLayersShared['visualization'];
    datasets: Dataset[];
    filters?: FilterField[];
    colors?: Field[];
    sort?: Sort[];
    shapes?: Field[];
    segments?: Field[];
    tooltips?: Field[];
}

function _receiveVisualization({
    visualization,
    datasets,
    filters,
    colors,
    sort,
    shapes,
    segments,
    tooltips,
}: PrivateReceiveVisualizationArgs) {
    const availableVisualizations = getAvailableVisualizations();
    const presetVisualization = availableVisualizations.find(({id}) => id === visualization.id) as
        | Shared['visualization']
        | null;

    if (!presetVisualization) {
        throw new Error('Unknown visualization');
    }

    const previousPlaceholders = [...(visualization.placeholders || [])];
    const fields = datasets.reduce((result: Field[], dataset: Dataset) => {
        return [...result, ...getResultSchemaFromDataset(dataset)] as Field[];
    }, []);

    // We put all the metadata from it into the saved one
    const placeholders = presetVisualization.placeholders.map((presetPlaceholder) => {
        const placeholder = previousPlaceholders.find(
            (p) => p.id === presetPlaceholder.id || p.type === presetPlaceholder.type,
        );

        if (placeholder) {
            const items = [...placeholder.items];

            // Saving the user settings of the container
            const settings: Record<string, any> = placeholder.settings || {};

            // We overwrite the placeholder metadata with predefined ones — we consider them a higher priority
            Object.assign(placeholder, presetPlaceholder);

            const presetSettings: Record<string, any> | undefined = presetPlaceholder.settings;
            const newSettings: Record<string, any> = {};

            // If there are settings for the section, we will put the newcomers
            if (presetSettings) {
                // Here's the subtle point:
                // Only the settings specified in constants are allowed
                // If the value differs from the default one, then it is used
                // Otherwise, the default value is taken
                // If there is no such setting at all in the acceptable ones, then it is cut out
                Object.keys(presetSettings).forEach((setting) => {
                    if (typeof settings[setting] === 'undefined') {
                        newSettings[setting] = presetSettings[setting];
                    } else {
                        newSettings[setting] = settings[setting];
                    }
                });
            }

            placeholder.settings = newSettings;

            items.forEach((item) => {
                mutateAndValidateItem({fields, item, placeholder: presetPlaceholder});
            });

            // We record the elements as new arrivals
            placeholder.items = items;

            return placeholder;
        } else {
            return presetPlaceholder;
        }
    });

    if (isVisualizationWithLayers(visualization)) {
        const {layers, selectedLayerId} = visualization;

        Object.assign(visualization, presetVisualization, {layers, selectedLayerId});

        visualization.layers.forEach((layer) => {
            _receiveVisualization({
                visualization: layer,
                datasets,
                filters: layer.commonPlaceholders.filters,
                colors: layer.commonPlaceholders.colors,
                sort: layer.commonPlaceholders.sort,
                shapes: layer.commonPlaceholders.shapes,
                tooltips: layer.commonPlaceholders.tooltips,
            });
        });
    } else {
        Object.assign(visualization, presetVisualization);
    }

    // Placeholders are recorded as new arrivals
    visualization.placeholders = placeholders;

    filters?.forEach((item) => mutateAndValidateItem({fields, item: item as unknown as Field}));
    colors?.forEach((item) => mutateAndValidateItem({fields, item}));
    sort?.forEach((item) => mutateAndValidateItem({fields, item}));
    shapes?.forEach((item) => mutateAndValidateItem({fields, item}));
    segments?.forEach((item) => mutateAndValidateItem({fields, item}));
    tooltips?.forEach((item) => mutateAndValidateItem({fields, item}));
}

interface ReceiveVisualizationArgs {
    visualization: Shared['visualization'];
    datasets?: Dataset[];
    filters?: FilterField[];
    colors?: Field[];
    sort?: Sort[];
    colorsConfig?: ColorsConfig;
    geopointsConfig?: PointSizeConfig;
    labels?: Field[];
    tooltips?: Field[];
    shapes?: Field[];
    segments?: Field[];
}

export function receiveVisualization({
    visualization,
    datasets = [],
    filters,
    colors,
    sort,
    colorsConfig,
    geopointsConfig,
    labels,
    tooltips,
    shapes,
    segments,
}: ReceiveVisualizationArgs) {
    let selectedVisualization = visualization;
    let updatedColors: Field[] = colors || [];

    const needUseConverter =
        visualization.id === 'geopoint' ||
        visualization.id === 'geopolygon' ||
        visualization.id === 'heatmap' ||
        visualization.id === 'polyline' ||
        visualization.id === 'geopoint-with-cluster';

    if (needUseConverter) {
        const newVisualization: VisualizationWithLayersShared['visualization'] = {
            ...GEOLAYER_VISUALIZATION,
        };
        newVisualization.layers = [
            convertVisualizationToGeolayer(
                visualization as unknown as VisualizationLayerShared['visualization'],
            ),
        ];
        newVisualization.layers[0].commonPlaceholders = {
            ...newVisualization.layers[0].commonPlaceholders,
            colors: colors!,
            colorsConfig: colorsConfig!,
            geopointsConfig: geopointsConfig!,
            labels: labels!,
            tooltips: tooltips!,
            shapes: shapes!,
        };
        selectedVisualization = newVisualization;
    }

    _receiveVisualization({
        visualization: selectedVisualization,
        datasets,
        filters,
        colors,
        sort,
        shapes,
        segments,
        tooltips,
    });

    if (selectedVisualization.id === WizardVisualizationId.PivotTable) {
        const visualizationAndFields = validatedAndUpdatePivotTableFields({
            colors: updatedColors,
            visualization: selectedVisualization,
        });

        updatedColors = visualizationAndFields.updatedColors;
        selectedVisualization = visualizationAndFields.updatedVisualization;
    }

    return {
        visualization: selectedVisualization,
        colors: updatedColors,
    };
}

interface SetSelectedLayerIdArgs {
    layerId: string;
    needUpdateCommonPlaceholders?: boolean;
    needUpdatePreview?: boolean;
    withoutRerender?: boolean;
}

export function updatePreviewWithRerender() {
    return (dispatch: WizardDispatch, getState: () => DatalensGlobalState) => {
        const visualizationState = getState().wizard.visualization;
        const visualization =
            visualizationState.visualization as VisualizationWithLayersShared['visualization'];
        const labels = visualizationState.labels;

        const updatedVisualiztion = {
            ...visualization,
            placeholders: [...visualization.placeholders],
            layers: visualization.layers?.map((layer) => ({
                ...layer,
                placeholders: [...layer.placeholders],
            })),
        };

        dispatch(
            setVisualization({
                visualization: updatedVisualiztion,
            }),
        );

        dispatch(setLabels({labels}));

        dispatch(updatePreviewAndClientChartsConfig({}));
    };
}

export function setSelectedLayerId({
    layerId,
    needUpdateCommonPlaceholders = true,
    needUpdatePreview = true,
    withoutRerender = false,
}: SetSelectedLayerIdArgs) {
    return (dispatch: WizardDispatch, getState: () => DatalensGlobalState) => {
        dispatch(_setSelectedLayerId({layerId}));

        const {
            dataset: {datasets, dataset: currentDataset},
        } = getState().wizard;
        const visualization = getState().wizard.visualization
            .visualization as VisualizationWithLayersShared['visualization'];

        const selectedLayerIndex = visualization.layers.findIndex(
            ({layerSettings: {id}}) => id === visualization.selectedLayerId,
        );
        const selectedLayer = visualization.layers[selectedLayerIndex];

        if (selectedLayer && selectedLayer.placeholders[0].items[0] && datasets.length > 1) {
            const {datasetId} = selectedLayer.placeholders[0].items[0];
            const dataset = datasets.find(({id}) => id === datasetId);

            if (dataset && dataset.id !== currentDataset!.id) {
                dispatch(setCurrentDataset({dataset}));
            }
        }

        if (selectedLayer && needUpdateCommonPlaceholders) {
            const {
                colors = [],
                colorsConfig = {},
                geopointsConfig = {} as PointSizeConfig,
                filters = [],
                labels = [],
                tooltips = [],
                shapes = [],
                shapesConfig = {},
            } = selectedLayer.commonPlaceholders;

            dispatch(setShapes({shapes}));
            dispatch(setShapesConfig({shapesConfig}));
            dispatch(setColors({colors: filterVisualizationColors(colors, selectedLayer)}));
            dispatch(setColorsConfig({colorsConfig}));
            dispatch(setPointsSizeConfig({geopointsConfig}));
            dispatch(setLayerFilters({filters}));
            dispatch(setLabels({labels}));
            dispatch(setTooltips({tooltips}));
        }

        if (needUpdatePreview) {
            dispatch(updatePreviewAndClientChartsConfig({withoutRerender}));
        }
    };
}

export function changeVisualizationLayerType(type: VisualizationLayerType) {
    return (dispatch: WizardDispatch, getState: () => DatalensGlobalState) => {
        const globalVisualization = selectVisualization(
            getState(),
        ) as VisualizationWithLayersShared['visualization'];

        const layers = [...globalVisualization.layers];

        const currentLayerIndex = layers.findIndex(
            ({layerSettings: {id}}) => id === globalVisualization.selectedLayerId,
        );

        if (currentLayerIndex === -1) {
            return;
        }

        if (layers[currentLayerIndex].layerSettings.type === type) {
            return;
        }

        const updatedLayer = updateVisualizationLayerType(layers[currentLayerIndex], type);

        const updatedLayers = getUpdatedLayers(layers, updatedLayer);

        dispatch(
            updateLayers({
                layers: updatedLayers,
            }),
        );

        dispatch(setSelectedLayerId({layerId: updatedLayer.layerSettings.id}));
    };
}

type UpdateDatasetByValidationArgs = {
    dataset: Dataset;
    updates: RawUpdate[] | Update[];
    needUpdate?: boolean;
};

export function updateDatasetByValidation({
    dataset,
    updates: rawUpdates,
    needUpdate = true,
}: UpdateDatasetByValidationArgs) {
    return async (dispatch: WizardDispatch, getState: () => DatalensGlobalState) => {
        const updates: Update[] = mapRawUpdatesToUpdates(rawUpdates, dataset);
        try {
            const {
                dataset: {result_schema: newResultSchema},
            } = await dispatch(validateDataset({dataset, updates}));

            const wizardState = getState().wizard;
            const wizardDataset = wizardState.dataset || {};
            const wizardVisualization = wizardState.visualization;
            const wizardPreview = wizardState.preview;
            const prevDatasets = wizardDataset.datasets || [];
            const oldUpdates = wizardPreview.updates;

            const result = getDatasetUpdates({
                dataset,
                updates,
                datasetSchema: newResultSchema as DatasetField[],

                currentDatasets: prevDatasets,
                currentUpdates: oldUpdates,
                visualization: wizardVisualization,
            });

            const visualization: Shared['visualization'] | undefined = getVisualization(
                wizardVisualization.visualization,
            );
            if (result.placeholders.length && visualization) {
                result.placeholders.forEach((placeholder) => {
                    dispatch(
                        setVisualizationPlaceholderItems({
                            visualization,
                            placeholder,
                            items: placeholder.items,
                        }),
                    );
                });
            }

            dispatch(
                setDatasetSchema({
                    dataset,
                    resultSchema: result.schema,
                    dimensions: result.dimensions || [],
                    measures: result.measures || [],
                }),
            );

            if (result.hierarchies) {
                dispatch(
                    setHierarchies({
                        hierarchies: result.hierarchies,
                    }),
                );
            }

            // We believe that if the validation was successful, then all updates are normal and we just set them in the store
            // If the validation fails, the updates will fail in catch
            dispatch(setUpdates({updates: result.updates}));

            dispatch(
                updatePreviewAndClientChartsConfig({
                    needRedraw: needUpdate,
                }),
            );

            return;
        } catch (error: any) {
            logger.logError('wizard: updateDatasetByValidation failed', error);
            console.error('updateDatasetByValidation failed', error);

            dispatch(
                actualizeAndSetUpdates({updates: rawUpdates, shouldMergeUpdatesFromState: true}),
            );

            return Boolean(
                updates.length &&
                    (updates[0].action === 'delete' || updates[0].action === 'delete_field'),
            );
        }
    };
}

const validateDataset = ({dataset, updates}: {dataset: Dataset; updates: Update[]}) => {
    return async (dispatch: WizardDispatch, getState: () => DatalensGlobalState) => {
        let preparedUpdates = updates.map((update) => {
            const {field} = update;
            Object.keys(field).forEach((key: string) => {
                if ((field as Record<string, any>)[key] === null) {
                    delete (field as Record<string, any>)[key];
                }
            });

            return update;
        });
        preparedUpdates = uniqWith(preparedUpdates, isEqual);

        const workbookId = selectWizardWorkbookId(getState());

        try {
            return await getSdk().bi.validateDataset(
                {
                    version: 'draft',
                    datasetId: dataset.id,
                    workbookId,
                    dataset: dataset.dataset,
                    updates: preparedUpdates,
                },
                {timeout: TIMEOUT_95_SEC},
            );
        } catch (error: any) {
            const filteredError = getFilteredObject(error, [
                'details.data.dataset',
                'details.data.options',
            ]);
            logger.logError('wizard: validateDataSet failed', filteredError);
            const validationData = error.details && error.details.data;
            let customError: DataLensApiError | undefined;
            if (validationData) {
                const errors = validationData?.dataset?.component_errors;
                const items = errors?.items;
                const componentItem = items?.[0];
                const errorDetails = componentItem?.errors?.[0];
                if (errorDetails) {
                    customError = {
                        details: items,
                        isCustomError: true,
                    } as ChartKitCustomError;
                }
            } else {
                throw new Error('No data from validateDataset action');
            }
            dispatch(
                showToast({
                    title: i18n('toast_wizard-dataset-validation-failure'),
                    type: 'danger',
                    error: customError,
                }),
            );

            return validationData;
        }
    };
};

function getDatasetWithLocalFields({
    dataset,
    updates,
    datasetId,
}: {
    dataset: Dataset;
    updates: Update[];
    datasetId?: string;
}) {
    return async (dispatch: WizardDispatch) => {
        const filteredUpdatesByDatasetId = filterUpdatesByDatasetId(
            updates,
            datasetId || dataset.id,
        );

        const response = await dispatch(
            validateDataset({
                dataset,
                updates: filteredUpdatesByDatasetId,
            }),
        );

        const datasetWithValidatedUpdates: Dataset['dataset'] | undefined = response?.dataset;

        const resultSchema = datasetWithValidatedUpdates?.result_schema || [];

        const updatedResultSchema: DatasetField[] = resultSchema.map((field) => {
            const foundedUpdate = filteredUpdatesByDatasetId.find(
                (update) => update.field.guid === field.guid,
            );

            if (foundedUpdate) {
                return {
                    ...field,
                    local: field.calc_mode === 'parameter' ? foundedUpdate.field.local : true,
                    quickFormula: foundedUpdate.field.quickFormula,
                } as DatasetField;
            }
            return field;
        });

        const updatedDataset: Dataset['dataset'] | null = datasetWithValidatedUpdates
            ? {...datasetWithValidatedUpdates, result_schema: updatedResultSchema}
            : null;

        return updatedDataset;
    };
}

type CreateFieldFromVisualizationArgs = {
    field: Field;
    quickFormula?: boolean;
    needUniqueTitle?: boolean;
    needUpdate?: boolean;
};

export const createFieldFromVisualization = ({
    field,
    quickFormula = true,
    needUniqueTitle = true,
    needUpdate = true,
}: CreateFieldFromVisualizationArgs) => {
    // eslint-disable-next-line complexity
    return async (dispatch: WizardDispatch, getState: () => DatalensGlobalState) => {
        const datasets = selectDatasets(getState());

        const dataset = (datasets || []).find((someDataset) => someDataset.id === field.datasetId);

        if (!dataset) {
            return;
        }

        // New random guid
        field.guid = uuidv1();

        // ONLY-client flag indicating that this is a local field
        field.local = true;

        if (field.aggregation !== 'none' || field.type === 'MEASURE') {
            field.type = DatasetFieldType.Measure;
        } else {
            field.type = DatasetFieldType.Dimension;
        }

        const fieldNext: Field = {
            local: field.local,

            // ONLY-client flag that this is a "fast formula"
            quickFormula,

            // All this data is vital when creating a new field from an old one
            guid: field.guid,
            type: field.type,
            datasetId: field.datasetId,
            source: field.source,
            data_type: field.data_type,
            cast: field.cast,
        } as Field;

        if (needUniqueTitle) {
            fieldNext.title = `title-${field.guid}`;
            fieldNext.originalTitle = field.title;
            fieldNext.fakeTitle = field.fakeTitle || field.title;
        } else {
            fieldNext.title = field.title;
        }

        if (field.avatar_id) {
            fieldNext.avatar_id = field.avatar_id;
        }

        if (field.grouping && field.grouping !== 'none') {
            const [operation, mode] = field.grouping.split('-');

            let functionName;
            if (operation === 'trunc') {
                functionName = 'datetrunc';
            } else {
                functionName = 'datepart';
                fieldNext.data_type = DATASET_FIELD_TYPES.INTEGER;
                fieldNext.cast = DATASET_FIELD_TYPES.INTEGER;
            }

            fieldNext.originalFormula = field.originalFormula || field.formula;

            let argument = `[${field.originalTitle || field.title}]`;
            // TODO: update this place after caste support for datetimetz
            const isShouldBeCastedToDatetime =
                field.data_type !== 'genericdatetime' && field.cast === 'genericdatetime';

            if (isShouldBeCastedToDatetime) {
                argument = `DATETIME(${argument})`;
            }

            const isShouldBeCastedToDate = field.data_type !== 'date' && field.cast === 'date';

            if (isShouldBeCastedToDate) {
                argument = `DATE(${argument})`;
            }

            field.formula = `${functionName}(${argument}, "${mode}")`;
            field.fakeTitle = field.fakeTitle || field.title;

            fieldNext.grouping = field.grouping;

            fieldNext.originalDateCast = field.cast;
            fieldNext.originalSource = field.source;
        } else if (
            field.cast === 'date' ||
            field.cast === 'datetimetz' ||
            field.cast === 'genericdatetime'
        ) {
            fieldNext.originalDateCast = field.initial_data_type || field.cast;
            fieldNext.originalFormula = field.originalFormula || field.formula;
        }

        if (field.formula) {
            // If there is a formula there, then we will put down all the accompanying attributes of the formula

            // In the grouping, we will allow aggregation
            if (fieldNext.grouping && fieldNext.grouping !== 'none') {
                fieldNext.aggregation = field.aggregation;
            } else {
                fieldNext.aggregation = field.aggregation;
                fieldNext.aggregation_locked = field.aggregation_locked;
                fieldNext.autoaggregated = field.autoaggregated;
            }

            if (needUniqueTitle) {
                field.fakeTitle = field.fakeTitle || field.title;
            }

            fieldNext.calc_mode = 'formula';
            fieldNext.formula = field.formula;
        } else {
            // If there is just a field, then we will put down all the accompanying attributes of a simple field
            fieldNext.aggregation = field.aggregation;
            fieldNext.aggregation_locked = field.aggregation_locked;
            fieldNext.autoaggregated = field.autoaggregated;
            fieldNext.calc_mode = 'direct';
            fieldNext.source = field.source;
            fieldNext.cast = field.cast;
            fieldNext.data_type = field.data_type;
            fieldNext.fakeTitle = field.fakeTitle || field.title;
        }

        await dispatch(
            updateDatasetByValidation({
                dataset,
                updates: [
                    {
                        action: 'add_field',
                        field: fieldNext,
                    },
                ],
                needUpdate,
            }),
        );

        const updatedDataset = selectDataset(getState());

        const updatedSchema = getResultSchemaFromDataset(updatedDataset);

        const updatedField = updatedSchema.find((field) => field.guid === fieldNext.guid);

        return updatedField || fieldNext;
    };
};

type UpdateFieldFromVisualizationArgs = {
    field: Field;
    needUpdate?: boolean;

    dataset: Dataset;
};

export const updateFieldFromVisualization = ({
    field,
    needUpdate = true,
    dataset,
}: UpdateFieldFromVisualizationArgs) => {
    // eslint-disable-next-line complexity
    return async (dispatch: WizardDispatch) => {
        if (!field.autoaggregated) {
            if (field.aggregation !== 'none') {
                field.type = DatasetFieldType.Measure;
            } else {
                field.type = DatasetFieldType.Dimension;
            }
        }

        if (field.grouping && field.grouping === 'none') {
            if (field.originalFormula) {
                field.formula = field.originalFormula;
                delete field.originalSource;
                delete field.originalFormula;
            } else if (field.originalSource) {
                field.source = field.originalSource;
                field.formula = '';
            } else if (
                field.cast === 'date' ||
                field.cast === 'datetimetz' ||
                field.cast === 'genericdatetime'
            ) {
                field.formula = field.originalFormula || field.formula;
            } else {
                field.formula = '';
            }
            if (
                field.cast === 'date' ||
                field.cast === 'datetimetz' ||
                field.cast === 'genericdatetime'
            ) {
                field.cast = (
                    field.originalDateCast === field.cast ? field.originalDateCast : field.cast
                ) as DATASET_FIELD_TYPES;
                field.data_type = (
                    field.originalDateCast === field.data_type
                        ? field.originalDateCast
                        : field.data_type
                ) as DATASET_FIELD_TYPES;
            } else {
                field.cast = (field.originalDateCast || field.cast) as DATASET_FIELD_TYPES;
                field.data_type = (field.originalDateCast ||
                    field.data_type) as DATASET_FIELD_TYPES;
            }
        } else if (field.grouping) {
            const [operation, mode] = field.grouping.split('-');

            let functionName;
            if (operation === 'trunc') {
                functionName = 'datetrunc';
            } else {
                functionName = 'datepart';
                field.data_type = DATASET_FIELD_TYPES.INTEGER;
                field.cast = DATASET_FIELD_TYPES.INTEGER;
            }

            let argument = `[${field.originalTitle || field.title}]`;
            // TODO: update this place after caste support for datetimetz - BI-1478
            const isShouldBeCastedToDatetime =
                field.data_type !== 'datetimetz' && field.originalDateCast === 'datetimetz';

            if (isShouldBeCastedToDatetime) {
                argument = `DATETIME(${argument})`;
            }

            const isShouldBeCastedToGenericDatetime =
                field.data_type !== 'genericdatetime' &&
                field.originalDateCast === 'genericdatetime';

            if (isShouldBeCastedToGenericDatetime) {
                argument = `GENERICDATETIME(${argument})`;
            }

            const isShouldBeCastedToDate =
                field.data_type !== 'date' && field.originalDateCast === 'date';

            if (isShouldBeCastedToDate) {
                argument = `DATE(${argument})`;
            }

            if (!field.originalFormula) {
                field.originalFormula = field.formula;
            }

            // If there is a source, it means that this field has not been grouped yet
            if (field.source) {
                field.fakeTitle = field.fakeTitle || field.title;

                field.originalDateCast = field.cast;
                field.originalSource = field.source;

                field.source = '';
            }

            field.formula = `${functionName}(${argument}, "${mode}")`;
        }

        // A field could have been changed to a formula
        if (field.formula) {
            field.calc_mode = 'formula';

            if (field.type === 'DIMENSION') {
                field.aggregation = DatasetFieldAggregation.None;
            }
        } else {
            field.calc_mode = 'direct';
        }

        delete field.conflict;
        delete field.undragable;

        field.valid = true;

        await dispatch(
            updateDatasetByValidation({
                dataset,
                updates: [
                    {
                        action: 'update_field',
                        field,
                    },
                ],
                needUpdate,
            }),
        );

        return field;
    };
};

type TransformVisualizationItemArgs = {
    transformField?: (field: Field) => Field;
    item: Field;
    needUpdate?: boolean;
};

export const transformVisualizationItem = ({
    transformField,
    item,
    needUpdate,
}: TransformVisualizationItemArgs) => {
    return async (dispatch: WizardDispatch, getState: () => DatalensGlobalState) => {
        const needPreviewUpdate = Boolean(needUpdate);
        const datasets = selectDatasets(getState());

        const dataset = cloneDeep(datasets.find((ds) => ds.id === item.datasetId));

        if (!transformField || isParameter(item) || !dataset) {
            return item;
        }

        const newItem = transformField(item);

        if (!newItem.transformed) {
            return newItem;
        }

        if (newItem.quickFormula) {
            return dispatch(
                updateFieldFromVisualization({
                    field: newItem,
                    needUpdate: needPreviewUpdate,
                    dataset,
                }),
            );
        }

        return dispatch(
            createFieldFromVisualization({
                field: newItem,
                needUpdate: needPreviewUpdate,
            }),
        );
    };
};

function mapRawUpdatesToUpdates(rawUpdates: RawUpdate[] | Update[], dataset: Dataset) {
    return rawUpdates.map((rawUpdate: RawUpdate | Update) => {
        const resultSchemaItem = getResultSchemaFromDataset(dataset).find((item) => {
            return item.guid === rawUpdate.field.guid;
        })!;

        if (!resultSchemaItem) {
            return rawUpdate;
        }

        const field = getUpdateField(resultSchemaItem, rawUpdate.field);

        return {
            ...rawUpdate,
            field,
        };
    });
}

function getUpdateField(oldField: DatasetField, newField: Field | UpdateField): UpdateField {
    type PlainObject = Record<string, any>;

    const initialField: UpdateField = {
        guid: newField.guid,
    };

    if (isParameter(oldField)) {
        if (newField?.new_id) {
            initialField.new_id = newField.new_id;
        }

        return {
            ...initialField,
            title: newField.title,
            calc_mode: newField.calc_mode,
            cast: newField.cast,
            default_value: String(newField.default_value),
        };
    }

    return Object.keys({...oldField, ...newField}).reduce((acc: UpdateField, key) => {
        if (
            (oldField as PlainObject)[key] !== (newField as PlainObject)[key] &&
            (newField as PlainObject)[key]
        ) {
            (acc as PlainObject)[key] = (newField as PlainObject)[key];
        }

        return acc;
    }, initialField);
}

type SetVisualizationArgs = {
    visualization: Shared['visualization'];
    qlMode?: boolean;
};

export function setVisualization({visualization, qlMode}: SetVisualizationArgs) {
    return (dispatch: WizardDispatch, getState: () => DatalensGlobalState) => {
        dispatch(
            _setVisualization({
                visualization,
                qlMode,
            }),
        );

        const wizardState = getState().wizard;

        // TODO: This object is actually used in SectionVisualization.
        // You will need to delete it, and rewrite the place of use.
        return {
            visualization,
            colors: wizardState.visualization.colors,
            colorsConfig: wizardState.visualization.colorsConfig,
            geopointsConfig: wizardState.visualization.geopointsConfig,
            sort: wizardState.visualization.sort,
            labels: wizardState.visualization.labels,
            tooltips: wizardState.visualization.tooltips,
        };
    };
}

type FetchWidgetArgs = {
    entryId: string;
    revId?: string;
    datasetsIds?: string[];
};

export function resetWizardStore() {
    return {
        type: RESET_WIZARD_STORE,
    };
}

export interface ResetWizardStoreAction {
    type: typeof RESET_WIZARD_STORE;
}

export function setWizardStore({store}: {store: WizardGlobalState}) {
    return {
        type: SET_WIZARD_STORE,
        store,
    };
}

export interface SetWizardStoreAction {
    type: typeof SET_WIZARD_STORE;
    store: WizardGlobalState;
}

type ProcessWidgetArgs = {
    widget: any;
    dispatch: WizardDispatch;
    getState: () => DatalensGlobalState;
    datasetsIds?: string[];
};

function processWidget(args: ProcessWidgetArgs) {
    const {widget, dispatch, getState} = args;
    const data = widget.data! as ExtendedChartsConfig;
    const config = mapChartsConfigToLatestVersion(data);

    // Actualize widget data after mapping
    widget.data = config;

    const datasetsIds = args.datasetsIds || config.datasetsIds;

    let widgetDataset: Dataset | undefined;
    let dataset: Dataset;
    let colors: Field[];
    let filters: FilterField[];
    let labels: Field[];
    let sort: Sort[];
    let tooltips: Field[];
    let shapes: Field[];
    let visualization: Shared['visualization'];
    let hierarchies: HierarchyField[];
    let links: Link[];
    let shapesConfig: object;
    let colorsConfig: object;
    let geopointsConfig: PointSizeConfig;
    let updates: Update[];
    let extraSettings: Shared['extraSettings'];
    let segments: Field[];

    const originalDatasets: Record<string, Dataset> = {};

    dispatch(
        receiveWidgetAndPrepareMetadata({
            data: widget,
            needToProgressLoading: true,
        }),
    );

    const workbookId = selectWizardWorkbookId(getState());

    return getDatasets({datasetsIds, workbookId})
        .then(async (all) => {
            const {datasets: loadedOriginalDatasets, errors: datasetApiErrors} = all;
            for (const loadedDataset of loadedOriginalDatasets) {
                const datasetId = loadedDataset.id;

                // cloneDeep to be sure that no changes to the dataset will affect the original
                originalDatasets[datasetId] = cloneDeep(loadedDataset);

                const chartUpdates = selectChartsConfigUpdates(config, loadedOriginalDatasets);

                const datasetWithUpdates = await dispatch(
                    getDatasetWithLocalFields({
                        dataset: loadedDataset,
                        updates: chartUpdates,
                    }),
                );

                if (datasetWithUpdates) {
                    loadedDataset.dataset = datasetWithUpdates;
                }

                if (loadedDataset.id === datasetId) {
                    dataset = loadedDataset;
                }

                if (loadedDataset.result_schema) {
                    delete loadedDataset.result_schema;
                }
            }

            dispatch(setDatasetApiErrors({datasetApiErrors}));
            dispatch(setOriginalDatasets({originalDatasets}));

            return loadedOriginalDatasets;
        })
        .then((datasets: Dataset[]) => {
            ({
                colors,
                filters,
                labels,
                sort,
                tooltips,
                shapes,
                hierarchies,

                visualization,
                links,
                colorsConfig,
                geopointsConfig = {} as PointSizeConfig,
                updates,
                shapesConfig,
                extraSettings,
                segments,
            } = mapChartsConfigToClientConfig(config, datasets, originalDatasets));

            dispatch(
                setLinks({
                    links,
                }),
            );

            dispatch(setExtraSettings(extraSettings));

            return datasets;
        })
        .then((datasets: Dataset[]) => {
            // Processing the affixing of all widget metadata
            dispatch(
                receiveWidgetAndPrepareMetadata({
                    data: widget,
                }),
            );

            dispatch(
                setDatasets({
                    datasets,
                }),
            );

            if (datasets && datasets.length > 1 && visualization.id === 'pivotTable') {
                dispatch(forceEnablePivotFallback());
            }

            const receiveVisualizationResult = receiveVisualization({
                visualization,
                datasets,
                filters,
                colors,
                colorsConfig,
                geopointsConfig,
                sort,
                labels,
                tooltips,
                shapes,
                segments,
            });

            visualization = receiveVisualizationResult.visualization;
            colors = receiveVisualizationResult.colors;

            // Set the dataset
            dispatch(setDataset({dataset}));

            const currentState = getState();
            const wizardDataset = currentState.wizard?.dataset;
            const filterFields = getAllDatasetsFields(wizardDataset);
            const dimensions = wizardDataset?.dimensions || [];

            const urlSearchParams = Array.from(new URLSearchParams(window.location.search));

            const {filtersParams, parametersParams} = splitParamsToParametersAndFilters(
                urlSearchParams,
                datasets.reduce(
                    (acc, dataset) => [...acc, ...getResultSchemaFromDataset(dataset)],
                    [] as Field[],
                ),
            );
            const preparedFiltersParams = prepareUrlParams(filtersParams);
            const preparedParametersParams = prepareUrlParams(parametersParams);

            const {filtersFields, chartFilters} = getFiltersFields(
                preparedFiltersParams,
                filters,
                filterFields,
            );

            const dashboardParameters = getParametersFields(preparedParametersParams, dimensions);

            // We put filters in geo layers
            if (isVisualizationWithLayers(visualization)) {
                visualization.layers.forEach((layer) => {
                    const layerFilters = layer.commonPlaceholders.filters;

                    // We set the disabled flag to filters that are overlaid with filters from the dashboard
                    layer.commonPlaceholders.filters = getChartFiltersWithDisabledProp({
                        dashboardFilters: filtersFields,
                        chartFilters: layerFilters,
                    });
                });
            }

            const fullFilters = [...chartFilters, ...filtersFields];
            filters = fullFilters as FilterField[];

            if (isVisualizationWithLayers(visualization)) {
                const selectedLayer = visualization.layers.find(
                    ({layerSettings: {id}}) =>
                        id ===
                        (visualization as VisualizationWithLayersShared['visualization'])
                            .selectedLayerId,
                );

                if (selectedLayer) {
                    colors = selectedLayer.commonPlaceholders.colors;
                    labels = selectedLayer.commonPlaceholders.labels;
                    tooltips = selectedLayer.commonPlaceholders.tooltips;
                    shapes = selectedLayer.commonPlaceholders.shapes || [];
                }
            }

            dispatch(setDashboardParameters({dashboardParameters}));

            // Set filters
            dispatch(setFilters({filters}));

            // Set divisions by colors
            dispatch(setColors({colors}));

            // Set the color settings
            dispatch(setColorsConfig({colorsConfig}));

            // Set the geotox settings
            dispatch(setPointsSizeConfig({geopointsConfig}));

            // Set the division by forms
            dispatch(setShapes({shapes}));

            // Set the form settings
            dispatch(setShapesConfig({shapesConfig}));

            // Set the sorting
            dispatch(setSort({sort}));

            // Set signatures
            dispatch(setLabels({labels}));

            // Set tooltips
            dispatch(setTooltips({tooltips}));

            // Set the segments
            dispatch(setSegments({segments}));

            // Set the visualization and all its parameters (which fields are selected)
            dispatch(setVisualization({visualization}));

            dispatch(
                setHierarchies({
                    hierarchies,
                }),
            );

            ({
                visualization: {
                    filters = [],
                    colors = [],
                    sort = [],
                    labels = [],
                    tooltips = [],
                    hierarchies = [],
                    shapes = [],
                } = {},
            } = getState().wizard);

            visualization = getState().wizard.visualization
                .visualization as Shared['visualization'];

            dispatch(actualizeAndSetUpdates({updates}));

            // Drawing a graph
            dispatch(
                updatePreviewAndClientChartsConfig({
                    isInitialPreview: true,
                }),
            );
        })
        .catch((error: DataLensApiError & {handeled: boolean}) => {
            if (error.handeled) {
                return;
            }
            logger.logError('wizard: fetchWidget failed', error as Error);

            dispatch(
                setDatasets({
                    datasets: [],
                }),
            );

            dispatch(
                setDataset({
                    error,
                    dataset: widgetDataset,
                    datasetId: datasetsIds[0],
                }),
            );

            // Removing the loader display
            dispatch(setWidgetLoadStatus({isLoading: false}));

            if (visualization) {
                const receivedVisualization = receiveVisualization({
                    visualization,
                });

                // Set the visualization and all its parameters (which fields are selected)
                dispatch(setVisualization({visualization: receivedVisualization.visualization}));
            }
        });
}

export function processCurrentWidgetWithDatasets({datasetsIds}: {datasetsIds: string[]}) {
    return function (dispatch: WizardDispatch, getState: () => DatalensGlobalState) {
        const widget = getState().wizard.widget.widget;

        processWidget({widget, dispatch, getState, datasetsIds});
    };
}

export function fetchWidget({entryId, revId, datasetsIds}: FetchWidgetArgs) {
    return function (dispatch: WizardDispatch, getState: () => DatalensGlobalState) {
        dispatch(setWidgetLoadStatus({isLoading: true}));

        const unreleased = false;

        oldSdk.charts
            .getWidget({entryId, unreleased, revId}, {cancelable: true})
            .catch((error) => {
                if (oldSdk.isCancel(error)) {
                    return null;
                }

                logger.logError('wizard: getWidget failed', error);
                dispatch(receiveWidgetAndPrepareMetadata({error}));

                const customError = new Error(error);

                (customError as any).handeled = true;

                throw customError;
            })
            .then((data) => {
                if (data?.type && !ENTRY_TYPES.wizard.includes(data.type)) {
                    const {pathname} = new URL(
                        navigateHelper.redirectUrlSwitcher({
                            ...data,
                            type: data.type,
                        }),
                    );
                    history.replace({...history.location, pathname});

                    return;
                }

                return data ? processWidget({widget: data, dispatch, getState, datasetsIds}) : null;
            });
    };
}

export type SetDefaultsArgs = {
    entryId: string | null;
    revId?: string;
    routeWorkbookId?: WorkbookId;
};

export function setDefaults({entryId, revId, routeWorkbookId}: SetDefaultsArgs) {
    return function (dispatch: WizardDispatch) {
        if (routeWorkbookId) {
            dispatch(setRouteWorkbookId(routeWorkbookId));
        }

        if (entryId) {
            dispatch(
                fetchWidget({
                    entryId,
                    revId,
                }),
            );
        } else {
            const defaultVisualization = getDefaultVisualization();

            dispatch(
                setVisualization({
                    visualization: cloneDeep(
                        defaultVisualization,
                    ) as unknown as Shared['visualization'],
                }),
            );
        }

        const searchPairs = new URLSearchParams(window.location.search);
        if (searchPairs) {
            const datasetId = searchPairs.get(WIZARD_DATASET_ID_PARAMETER_KEY);

            if (datasetId && !entryId) {
                dispatch(
                    fetchDataset({
                        id: datasetId,
                    }),
                );
            }
        } else if (!entryId) {
            dispatch(toggleNavigation());
        }

        dispatch(setDefaultsSet());
    };
}

type RemoveQuickFormulaArgs = {
    field: Field;
    needUpdate: boolean;
    datasets: Dataset[];
};

export function removeQuickFormula({field, needUpdate = true, datasets}: RemoveQuickFormulaArgs) {
    return (dispatch: WizardDispatch) => {
        const currentDataset = datasets.find((dataset) => dataset.id === field.datasetId);
        if (currentDataset) {
            return dispatch(
                updateDatasetByValidation({
                    dataset: currentDataset,
                    updates: [
                        {
                            action: 'delete_field',
                            field,
                        },
                    ],
                    needUpdate,
                }),
            );
        }
        return;
    };
}

export function getAllDatasetsFields(dataset: DatasetState): Field[] {
    const fields: Field[] = [];

    if (!dataset) {
        return [];
    }

    const datasets = dataset.datasets || [];

    for (let i = 0; i < datasets.length; i++) {
        fields.push(...((datasets[i]?.dataset?.result_schema || []) as Field[]));
    }

    return fields;
}
