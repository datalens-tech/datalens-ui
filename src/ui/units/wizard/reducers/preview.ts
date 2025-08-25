// @ts-ignore
import sha1 from 'js-sha1';
import isEmpty from 'lodash/isEmpty';
import type {
    ClientChartsConfigWithDataset,
    ColorsConfig,
    Dataset,
    Field,
    FilterField,
    HierarchyField,
    Link,
    Placeholder,
    PointSizeConfig,
    ShapesConfig,
    Shared,
    Sort,
    TableShared,
    Update,
    VisualizationWithLayersShared,
    WizardVisualizationId,
} from 'shared';
import {
    WizardType,
    isD3Visualization,
    isDimensionField,
    isMeasureField,
    isPseudoField,
    isVisualizationWithLayers,
} from 'shared';

import type {ResetWizardStoreAction} from '../actions';
import type {HighchartsWidget, PreviewAction} from '../actions/preview';
import {
    SET_DESCRIPTION,
    SET_HIGHCHARTS_WIDGET,
    SET_UPDATES,
    UPDATE_CLIENT_CHARTS_CONFIG,
    UPDATE_PREVIEW,
} from '../actions/preview';
import {VISUALIZATION_IDS} from '../constants';
import {getSelectedLayer, versionExtractor} from '../utils/helpers';

import {clearUnusedVisualizationItems} from './utils';
import {getConfigData} from './utils/getConfigData';
import {updateColorsHierarchies} from './utils/updateColorHierarchies';
import {updateVisualizationHierarchies} from './visualization';

export interface PreviewState {
    config?: {
        shared: ClientChartsConfigWithDataset;
    };
    configType: WizardType | undefined;
    isLoading: boolean;
    previewEntryId: string | undefined;
    colors: Field[];
    colorsConfig: ColorsConfig;
    geopointsConfig: PointSizeConfig;
    datasets: Dataset[];
    dataset: Dataset | undefined;
    filters: FilterField[];
    labels: Field[];
    links: Link[];
    sort: Sort[];
    tooltips: Field[];
    updates: Update[];
    visualization: Shared['visualization'] | {id?: string};
    extraSettings: Shared['extraSettings'] | object;
    hierarchies: HierarchyField[];
    highchartsWidget: HighchartsWidget | undefined;
    hash: string;
    shapes: Field[];
    segments: Field[];
    shapesConfig: ShapesConfig;
    initialPreviewHash: string;
    description?: string;
}

export type ConfigDataState = Pick<
    PreviewState,
    | 'colors'
    | 'colorsConfig'
    | 'extraSettings'
    | 'filters'
    | 'geopointsConfig'
    | 'hierarchies'
    | 'labels'
    | 'links'
    | 'sort'
    | 'tooltips'
    | 'updates'
    | 'visualization'
    | 'shapes'
    | 'shapesConfig'
    | 'segments'
    | 'datasets'
>;

export const getInitialState = (): PreviewState => ({
    config: undefined,
    configType: undefined,
    isLoading: false,
    previewEntryId: undefined,
    colors: [],
    colorsConfig: {},
    geopointsConfig: {} as PointSizeConfig,
    datasets: [],
    dataset: undefined,
    filters: [],
    labels: [],
    links: [],
    sort: [],
    tooltips: [],
    updates: [],
    visualization: {},
    extraSettings: {},
    hierarchies: [],
    highchartsWidget: undefined,
    hash: '',
    shapes: [],
    shapesConfig: {},
    initialPreviewHash: '',
    segments: [],
});

function checkDatasetLinks(args: {fields: Field[]; links: Link[]}) {
    const {fields, links} = args;
    let isValid = true;

    // We check the connections in pairs
    for (let i = 0; i < fields.length; ++i) {
        const field = fields[i];

        if (isPseudoField(field)) {
            continue;
        }

        for (let j = i + 1; j < fields.length; ++j) {
            const otherField = fields[j];

            if (isPseudoField(otherField)) {
                continue;
            }

            if (field.datasetId !== otherField.datasetId) {
                // All pairs of dimensions must be connected
                if (isDimensionField(field) && isDimensionField(otherField)) {
                    isValid = links.some((link: Link) => {
                        const linkField = link.fields[field.datasetId];
                        const linkOtherField = link.fields[otherField.datasetId];

                        if (linkField && linkOtherField) {
                            return (
                                linkField.field.guid === field.guid ||
                                linkOtherField.field.guid === otherField.guid
                            );
                        } else {
                            return false;
                        }
                    });
                    // In each pair of measurement and indicator, the indicator dataset must have
                    // connection to this dimension
                } else if (
                    (isDimensionField(field) && isMeasureField(otherField)) ||
                    (isMeasureField(field) && isDimensionField(otherField))
                ) {
                    const dimension = isDimensionField(field) ? field : otherField;
                    const measure = isMeasureField(field) ? field : otherField;

                    isValid = links.some((link: Link) => {
                        const linkDimension = link.fields[dimension.datasetId];
                        const linkMeasure = link.fields[measure.datasetId];

                        if (linkDimension && linkMeasure) {
                            return linkDimension.field.guid === dimension.guid;
                        } else {
                            return false;
                        }
                    });
                }
            }

            if (!isValid) {
                break;
            }
        }

        if (!isValid) {
            field.conflict = 'link-failed';
            break;
        }
    }

    return isValid;
}

interface MutateAndValidateVisualizationArgs {
    visualization: Shared['visualization'];
    datasets: Dataset[];
    filters: FilterField[];
    colors: Field[];
    sort: Sort[];
    labels: Field[];
    links: Link[];
    tooltips: Field[];
    shapes?: Field[];
}

function mutateAndValidateVisualization({
    visualization,
    datasets,
    filters,
    colors,
    sort,
    labels,
    links,
    tooltips,
    shapes = [],
}: MutateAndValidateVisualizationArgs) {
    // We validate each item sequentially, while it is important that each previous item is executed
    let everythingIsOk = visualization.placeholders.some((placeholder: Placeholder) => {
        return placeholder.items.length > 0;
    });

    // Are all the necessary placeholders filled in and are there any conflicting fields in them
    everythingIsOk =
        everythingIsOk &&
        visualization.placeholders.every((placeholder: Placeholder) => {
            const notEmpty = !placeholder.required || placeholder.items.length > 0;
            return (
                notEmpty &&
                placeholder.items.every((item) => !item.conflict || item.conflict === 'link-failed')
            );
        });

    // Are the filters valid
    everythingIsOk =
        everythingIsOk &&
        filters.every((item: FilterField) => {
            return item.filter;
        });

    // Are the fields valid in other secondary containers
    everythingIsOk =
        everythingIsOk &&
        [colors, sort, labels, tooltips, shapes].every((container) => {
            return container.every((item: Field) => {
                return !item.conflict;
            });
        });

    // Are the required colors filled in
    everythingIsOk =
        everythingIsOk &&
        Boolean(!visualization.colorsRequired || (visualization.colorsRequired && colors.length));

    if (everythingIsOk && datasets.length > 1) {
        let fields: Field[] = [];

        visualization.placeholders.forEach((placeholder: Placeholder) => {
            fields = fields.concat(placeholder.items);
        });

        fields = fields.concat(colors, sort, labels, tooltips, shapes);

        fields.forEach((field) => {
            field.conflict = undefined;
        });

        everythingIsOk = checkDatasetLinks({fields, links});
    }

    return everythingIsOk;
}

const getChartTypeByVisualizationId = (visualizationId: string): WizardType => {
    if (isD3Visualization(visualizationId as WizardVisualizationId)) {
        return WizardType.GravityChartsWizardNode;
    }

    switch (visualizationId) {
        case VISUALIZATION_IDS.FLAT_TABLE:
        case VISUALIZATION_IDS.PIVOT_TABLE: {
            return WizardType.TableWizardNode;
        }
        case VISUALIZATION_IDS.GEOPOINT:
        case VISUALIZATION_IDS.GEOPOLYGON:
        case VISUALIZATION_IDS.HEATMAP:
        case VISUALIZATION_IDS.GEOLAYER:
        case VISUALIZATION_IDS.POLYLINE: {
            return WizardType.YmapWizardNode;
        }
        case VISUALIZATION_IDS.METRIC: {
            return WizardType.MetricWizardNode;
        }
        default: {
            return WizardType.GraphWizardNode;
        }
    }
};

// eslint-disable-next-line complexity
export function preview(
    state = getInitialState(),
    action: PreviewAction | ResetWizardStoreAction,
): PreviewState {
    switch (action.type) {
        case SET_UPDATES: {
            return {
                ...state,
                updates: action.updates,
            };
        }
        case UPDATE_CLIENT_CHARTS_CONFIG: {
            const {
                isInitialPreview,
                // When you need to save the chart config without redrawing it
                // Example - changing the severity of a geo layer
                withoutRerender,
            } = action.clientChartsConfigArgs;

            if (typeof state.configType === 'undefined') {
                return state;
            }

            const sortedData = getConfigData(state);

            const version = JSON.stringify(sortedData, versionExtractor);
            const hash = sha1(version);

            const wizardDataset = state.dataset;

            return {
                ...state,
                hash,
                ...(!withoutRerender && {
                    config: {
                        shared: {
                            ...sortedData,
                            wizardDataset,
                        },
                    },
                    isLoading: true,
                }),

                ...(Boolean(isInitialPreview) && {
                    initialPreviewHash: hash,
                }),
            };
        }
        case UPDATE_PREVIEW: {
            const preview = action.preview;
            const {previewEntryId, needRedraw = true} = preview;

            if (isEmpty(preview)) {
                return state;
            }

            let {geopointsConfig, datasets, filters, links, tooltips, hierarchies} = preview;

            datasets = datasets || state.datasets || [];
            geopointsConfig = geopointsConfig || state.geopointsConfig || {};
            filters = filters || state.filters || [];
            links = links || state.links || [];
            tooltips = tooltips || state.tooltips || [];
            hierarchies = hierarchies || state.hierarchies || [];

            let extraSettings = preview.extraSettings || state.extraSettings || {};
            let visualization = (preview.visualization ||
                state.visualization ||
                {}) as Shared['visualization'];
            const updates = state.updates;

            const receivedShapes = preview.shapes || state.shapes || [];
            const receivedShapesConfig = preview.shapesConfig || state.shapesConfig || {};
            let receivedColors = preview.colors || state.colors || [];
            const receivedColorsConfig = preview.colorsConfig || state.colorsConfig || {};
            const receivedSort = preview.sort || state.sort || [];
            const receivedLabels = preview.labels || state.labels || [];
            const receivedSegments = preview.segments || state.segments || [];

            if (
                (extraSettings as TableShared['extraSettings'])?.pagination === 'on' &&
                datasets.length > 1
            ) {
                extraSettings = {
                    ...extraSettings,
                    pagination: 'off',
                };
            }

            // TODO: remove after updating the updateVisualizationHierarchies method
            if (visualization.id && visualization.id !== 'geolayer') {
                visualization = updateVisualizationHierarchies(
                    visualization as Shared['visualization'],
                    hierarchies,
                );
                const updatedColorsAndVisualization = updateColorsHierarchies(
                    receivedColors,
                    hierarchies,
                    visualization,
                );
                visualization = updatedColorsAndVisualization.visualization as
                    | Shared['visualization']
                    | VisualizationWithLayersShared['visualization'];
                receivedColors = updatedColorsAndVisualization.colors;
            }

            if (!needRedraw) {
                return {
                    ...getInitialState(),
                    config: state.config,
                    configType: state.configType,
                    initialPreviewHash: state.initialPreviewHash,
                    colors: receivedColors,
                    colorsConfig: receivedColorsConfig,
                    geopointsConfig,
                    datasets,
                    dataset: datasets[0],
                    filters,
                    labels: receivedLabels,
                    links,
                    sort: receivedSort,
                    tooltips,
                    visualization,
                    extraSettings,
                    shapes: receivedShapes,
                    shapesConfig: receivedShapesConfig,
                    updates,
                    hierarchies,
                    segments: receivedSegments,
                };
            }

            const {shapes, shapesConfig, colors, colorsConfig, sort, labels, segments} =
                clearUnusedVisualizationItems({
                    visualization: visualization as Shared['visualization'],
                    items: {
                        shapes: receivedShapes,
                        shapesConfig: receivedShapesConfig,
                        colors: receivedColors,
                        colorsConfig: receivedColorsConfig,
                        sort: receivedSort,
                        labels: receivedLabels,
                        segments: receivedSegments,
                    },
                });

            if (previewEntryId) {
                return {
                    ...state,
                    previewEntryId,
                };
            }

            let needToUpdatePreview = true;
            let everythingIsOk = false;

            if (isVisualizationWithLayers(visualization)) {
                const selectedLayer = getSelectedLayer(visualization)!;

                const valid = mutateAndValidateVisualization({
                    visualization: selectedLayer,
                    colors: selectedLayer.commonPlaceholders.colors,
                    sort: selectedLayer.commonPlaceholders.sort,
                    labels: selectedLayer.commonPlaceholders.labels,
                    tooltips: selectedLayer.commonPlaceholders.tooltips,
                    links,
                    datasets,
                    filters,
                });

                const alreadyInvalid = !selectedLayer.layerSettings.valid;

                selectedLayer.layerSettings.valid = valid;

                // Draw a chart if at least one layer is valid
                if (valid) {
                    everythingIsOk = true;
                }

                // Do not update the preview if the selected layer remains invalid
                // after the manipulations carried out on him
                if (selectedLayer && !valid && alreadyInvalid) {
                    needToUpdatePreview = false;
                }
            } else {
                everythingIsOk = mutateAndValidateVisualization({
                    visualization: visualization as Shared['visualization'],
                    datasets,
                    filters,
                    colors,
                    sort,
                    labels,
                    links,
                    tooltips,
                    shapes,
                });
            }

            const prevVisId = state.visualization && state.visualization.id;
            const currentVisId = preview.visualization && preview.visualization.id;

            // We update the preview in case of switching to geo layers from another visualization
            if (currentVisId === VISUALIZATION_IDS.GEOLAYER && prevVisId !== currentVisId) {
                needToUpdatePreview = true;
            }

            if (!needToUpdatePreview) {
                return {
                    ...state,
                    visualization,
                };
            }

            const newState = {
                ...state,
                colors,
                colorsConfig,
                dataset: datasets[0],
                datasets,
                extraSettings,
                geopointsConfig,
                filters,
                labels,
                links,
                sort,
                tooltips,
                visualization,
                hierarchies,
                shapesConfig,
                shapes,
                updates,
                segments,
            };

            if (everythingIsOk) {
                const configType = getChartTypeByVisualizationId(visualization.id!);

                return {
                    ...newState,
                    configType,
                };
            }

            return {
                ...newState,
                config: undefined,
                configType: undefined,
                isLoading: true,
            };
        }

        case SET_HIGHCHARTS_WIDGET: {
            const {highchartsWidget} = action;

            return {
                ...state,
                isLoading: false,
                highchartsWidget,
            };
        }

        case SET_DESCRIPTION: {
            return {
                ...state,
                description: action.payload,
            };
        }

        default: {
            return state;
        }
    }
}
