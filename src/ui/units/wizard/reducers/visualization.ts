import update from 'immutability-helper';
import {
    ColorsConfig,
    CommonNumberFormattingOptions,
    DATASET_FIELD_TYPES,
    Field,
    FilterField,
    GraphShared,
    HierarchyField,
    Placeholder,
    PointSizeConfig,
    ShapesConfig,
    Shared,
    Sort,
    TableShared,
    VisualizationLayerShared,
    VisualizationWithLayersShared,
    WizardVisualizationId,
    isFieldHierarchy,
    isMeasureField,
    isMeasureValue,
    isVisualizationWithLayers,
    isVisualizationWithSeveralFieldsXPlaceholder,
} from 'shared';

import {ResetWizardStoreAction} from '../actions';
import {SET_HIERARCHIES} from '../actions/dataset';
import {
    SET_AVAILABLE,
    SET_COLORS,
    SET_COLORS_CONFIG,
    SET_DASHBOARD_PARAMETERS,
    SET_DISTINCTS,
    SET_DRILL_DOWN_LEVEL,
    SET_FILTERS,
    SET_LABELS,
    SET_LAYER_FILTERS,
    SET_POINTS_SIZE_CONFIG,
    SET_SEGMENTS,
    SET_SELECTED_LAYER_ID,
    SET_SHAPES,
    SET_SHAPES_CONFIG,
    SET_SORT,
    SET_TOOLTIPS,
    SET_VISUALIZATION,
    SET_VISUALIZATION_PLACEHOLDER_ITEMS,
    UPDATE_LAYERS,
    UPDATE_PLACEHOLDER_SETTINGS,
    VisualizationAction,
} from '../actions/visualization';
import {getSelectedLayer} from '../utils/helpers';
import {getPlaceholderAxisModeMap, isPlaceholderWithAxisMode} from '../utils/placeholder';

import {clearUnusedVisualizationItems, getPlaceholdersWithMergedSettings} from './utils';
import {updateColorsHierarchies} from './utils/updateColorHierarchies';

export interface VisualizationState {
    visualization:
        | Shared['visualization']
        | VisualizationWithLayersShared['visualization']
        | undefined;
    filters: FilterField[];
    colors: Field[];
    colorsConfig: ColorsConfig;
    geopointsConfig: PointSizeConfig;
    sort: Sort[];
    labels: Field[];
    tooltips: Field[];
    hierarchies: HierarchyField[];
    layers: VisualizationWithLayersShared['visualization']['layers'];
    shapes: Field[];
    segments: Field[];
    shapesConfig: ShapesConfig;
    available: Field[];
    dashboardParameters: Field[];
    distincts?: Record<string, string[]>;
    drillDownLevel: number;
}

const initialState: VisualizationState = {
    visualization: undefined,
    filters: [],
    colors: [],
    colorsConfig: {},
    geopointsConfig: {} as PointSizeConfig,
    sort: [],
    labels: [],
    tooltips: [],
    hierarchies: [],
    layers: [],
    shapes: [],
    shapesConfig: {},
    dashboardParameters: [],
    segments: [],
    available: [],
    drillDownLevel: 0,
};

const VISUALIZATION_WITH_DISABLED_MEASURE_COLOR = new Set([
    WizardVisualizationId.Line,
    WizardVisualizationId.Area,
    WizardVisualizationId.Area100p,
]);
const VISUALIZATION_WITH_LABEL_MODE = new Set([
    WizardVisualizationId.Bar100p,
    WizardVisualizationId.Area100p,
    WizardVisualizationId.Column100p,
    WizardVisualizationId.Pie,
    WizardVisualizationId.Donut,
]);

// eslint-disable-next-line complexity
export function visualization(
    state = initialState,
    action: VisualizationAction | ResetWizardStoreAction,
): VisualizationState {
    switch (action.type) {
        case SET_VISUALIZATION: {
            let visualization: Shared['visualization'];
            let oldVisualization: Shared['visualization'];

            if (isVisualizationWithLayers(action.visualization)) {
                visualization = getSelectedLayer(action.visualization)!;
            } else {
                visualization = action.visualization;
            }

            const {qlMode} = action;

            if (isVisualizationWithLayers(state.visualization)) {
                oldVisualization = getSelectedLayer(state.visualization)!;
            } else {
                oldVisualization = state.visualization as Shared['visualization'];
            }

            const {geopointsConfig} = state;
            let {tooltips} = state;

            let prevColors = state.colors;

            if (oldVisualization && oldVisualization.id !== visualization.id) {
                const transition = `${oldVisualization.id}-${visualization.id}`;

                visualization.placeholders = getPlaceholdersWithMergedSettings({
                    oldPlaceholders: oldVisualization.placeholders || [],
                    newPlaceholders: visualization.placeholders || [],
                    oldVisualizationId: oldVisualization.id,
                });

                const placeholders = visualization.placeholders || [];
                const oldPlaceholders = oldVisualization.placeholders || [];

                if (
                    VISUALIZATION_WITH_DISABLED_MEASURE_COLOR.has(
                        visualization.id as WizardVisualizationId,
                    )
                ) {
                    prevColors = prevColors.filter(
                        (color) => !isMeasureField(color) && !isMeasureValue(color),
                    );
                }

                // Let's describe how the crossection will occur when the visualization changes

                switch (transition) {
                    // In this transition, the constraints on the fields in the sections are equivalent
                    case 'line-area':
                    case 'line-area100p':
                    case 'line-column':
                    case 'line-column100p':
                    case 'line-bar':
                    case 'line-bar100p':
                    case 'line-treemap':
                    case 'area-line':
                    case 'area-area100p':
                    case 'area-column':
                    case 'area-column100p':
                    case 'area-bar':
                    case 'area-bar100p':
                    case 'area100p-line':
                    case 'area100p-area':
                    case 'area100p-column':
                    case 'area100p-column100p':
                    case 'area100p-bar':
                    case 'area100p-bar100p':
                    case 'column-line':
                    case 'column-area':
                    case 'column-area100p':
                    case 'column-bar':
                    case 'column-bar100p':
                    case 'column-column100p':
                    case 'column100p-line':
                    case 'column100p-area':
                    case 'column100p-column':
                    case 'column100p-bar':
                    case 'column100p-bar100p':
                    case 'column100p-area100p':
                    case 'bar-line':
                    case 'bar-area':
                    case 'bar-area100p':
                    case 'bar-column':
                    case 'bar-column100p':
                    case 'bar-bar100p':
                    case 'bar100p-line':
                    case 'bar100p-area':
                    case 'bar100p-area100p':
                    case 'bar100p-column':
                    case 'bar100p-column100p':
                    case 'bar100p-bar':
                    case 'pie-line':
                    case 'pie-area':
                    case 'pie-area100p':
                    case 'pie-column':
                    case 'pie-column100p':
                    case 'pie-bar':
                    case 'pie-bar100p':
                    case 'pie-donut':
                    case 'donut-line':
                    case 'donut-area':
                    case 'donut-area100p':
                    case 'donut-column':
                    case 'donut-column100p':
                    case 'donut-bar':
                    case 'donut-bar100p':
                    case 'donut-pie':
                    case 'treemap-line':
                    case 'treemap-area':
                    case 'treemap-area100p':
                    case 'treemap-column':
                    case 'treemap-column100p':
                    case 'treemap-bar':
                    case 'treemap-bar100p':
                    case 'line-line-d3':
                    case 'line-d3-line':
                        if (oldPlaceholders[0].items.length) {
                            const isNextVisualizationCombinedChart =
                                action.visualization.id === WizardVisualizationId.CombinedChart;
                            const isPrevVisualizationCombinedChart =
                                state.visualization?.id === WizardVisualizationId.CombinedChart;

                            const isPlaceholderSupportTwoItems =
                                isNextVisualizationCombinedChart ||
                                (isPrevVisualizationCombinedChart &&
                                    isVisualizationWithSeveralFieldsXPlaceholder(
                                        action.visualization.id,
                                    ));
                            const lastElementToSlice = isPlaceholderSupportTwoItems ? 2 : 1;
                            placeholders[0].items = [
                                ...oldPlaceholders[0].items.slice(0, lastElementToSlice),
                            ];
                        }

                        placeholders[1].items = oldPlaceholders[1].items;
                        break;

                    case 'area-treemap':
                    case 'area100p-treemap':
                    case 'column-treemap':
                    case 'column100p-treemap':
                    case 'bar-treemap':
                    case 'bar100p-treemap':
                    case 'pie-treemap':
                    case 'donut-treemap':
                        if (oldPlaceholders[0].items.length) {
                            placeholders[0].items = [oldPlaceholders[0].items[0]];
                        }

                        if (oldPlaceholders[1].items.length) {
                            placeholders[1].items = [oldPlaceholders[1].items[0]];
                        }

                        break;

                    // Pie can have only 1 dimension and 1 metric
                    // There can be only 1 indicator or dimension in a scatter
                    case 'line-pie':
                    case 'area-pie':
                    case 'area100p-pie':
                    case 'column-pie':
                    case 'column100p-pie':
                    case 'bar-pie':
                    case 'bar100p-pie':
                    case 'treemap-pie':
                    case 'line-donut':
                    case 'area-donut':
                    case 'area100p-donut':
                    case 'column-donut':
                    case 'column100p-donut':
                    case 'bar-donut':
                    case 'bar100p-donut':
                    case 'treemap-donut':
                    case 'line-scatter':
                    case 'area-scatter':
                    case 'area100p-scatter':
                    case 'column-scatter':
                    case 'column100p-scatter':
                    case 'bar-scatter':
                    case 'bar100p-scatter':
                    case 'pie-scatter':
                    case 'donut-scatter':
                    case 'treemap-scatter':
                        if (oldPlaceholders[0].items.length) {
                            placeholders[0].items = [oldPlaceholders[0].items[0]];
                        }

                        if (oldPlaceholders[1].items.length) {
                            placeholders[1].items = [oldPlaceholders[1].items[0]];
                        }
                        break;

                    // When switching to flatTable, all fields go to the first one
                    case 'line-flatTable':
                    case 'area-flatTable':
                    case 'area100p-flatTable':
                    case 'column-flatTable':
                    case 'column100p-flatTable':
                    case 'bar-flatTable':
                    case 'bar100p-flatTable':
                    case 'pie-flatTable':
                    case 'donut-flatTable':
                    case 'treemap-flatTable':
                        placeholders[0].items = [
                            ...oldPlaceholders[0].items,
                            ...oldPlaceholders[1].items,
                        ].filter((item) => {
                            return item.type !== 'PSEUDO';
                        });
                        prevColors = prevColors.filter((color) => !isFieldHierarchy(color));
                        break;

                    // From the scatter similarly, only there are 3 sections
                    case 'scatter-flatTable':
                        placeholders[0].items = [
                            ...oldPlaceholders[0].items,
                            ...oldPlaceholders[1].items,
                            ...oldPlaceholders[2].items,
                        ];
                        prevColors = prevColors.filter((color) => !isFieldHierarchy(color));
                        break;

                    // When switching to PivotTable, only one of the dimensions and indicators is filled in
                    case 'line-pivotTable':
                    case 'area-pivotTable':
                    case 'area100p-pivotTable':
                    case 'column-pivotTable':
                    case 'column100p-pivotTable':
                    case 'bar-pivotTable':
                    case 'bar100p-pivotTable':
                    case 'pie-pivotTable':
                    case 'donut-pivotTable':
                    case 'treemap-pivotTable':
                        placeholders[0].items = oldPlaceholders[0].items.filter(
                            (item) => item.type !== 'PSEUDO',
                        );
                        placeholders[2].items = oldPlaceholders[1].items;
                        prevColors = prevColors.filter((color) => !isFieldHierarchy(color));
                        break;

                    case 'scatter-pivotTable': {
                        const items = [...oldPlaceholders[0].items, ...oldPlaceholders[1].items];
                        const dimensions = items.filter((item) => {
                            return item.type === 'DIMENSION';
                        });

                        const measures = items.filter((item) => {
                            return item.type === 'MEASURE';
                        });

                        if (dimensions.length > 0) {
                            placeholders[0].items = [dimensions[0]];
                        }

                        if (measures.length > 0) {
                            placeholders[2].items = [measures[0]];
                        }

                        prevColors = prevColors.filter((color) => !isFieldHierarchy(color));

                        break;
                    }

                    // When moving from flatTable, the first dimension and the first metric are selected from the heap
                    case 'flatTable-line':
                    case 'flatTable-area':
                    case 'flatTable-area100p':
                    case 'flatTable-scatter':
                    case 'flatTable-column':
                    case 'flatTable-column100p':
                    case 'flatTable-bar':
                    case 'flatTable-bar100p':
                    case 'flatTable-pie':
                    case 'flatTable-donut':
                    case 'flatTable-treemap':
                    case 'scatter-line':
                    case 'scatter-area':
                    case 'scatter-area100p':
                    case 'scatter-column':
                    case 'scatter-column100p':
                    case 'scatter-bar':
                    case 'scatter-bar100p':
                    case 'scatter-pie':
                    case 'scatter-donut':
                    case 'scatter-treemap': {
                        const items: Field[] = [];

                        oldPlaceholders.forEach((placeholder) => {
                            placeholder.items.forEach((item) => {
                                items.push(item);
                            });
                        });

                        let measures: Field[] = [];
                        let dimensions: Field[] = [];

                        if (qlMode) {
                            measures = items.filter((item) => {
                                return item.data_type === 'integer' || item.data_type === 'float';
                            });

                            dimensions = items.filter((item) => {
                                return measures.every((measure) => item.title !== measure.title);
                            });
                        } else {
                            dimensions = items.filter((item) => {
                                return item.type === 'DIMENSION' && item.data_type !== 'markup';
                            });

                            measures = items.filter((item) => {
                                return item.type === 'MEASURE' && item.data_type !== 'markup';
                            });
                        }

                        if (dimensions.length > 0) {
                            placeholders[0].items = [dimensions[0]];
                        }

                        if (measures.length > 0) {
                            placeholders[1].items = [measures[0]];
                        }

                        break;
                    }

                    case 'flatTable-pivotTable': {
                        const dimensions = oldPlaceholders[0].items.filter((item) => {
                            return item.type === 'DIMENSION';
                        });

                        const measures = oldPlaceholders[0].items.filter((item) => {
                            return item.type === 'MEASURE';
                        });

                        if (dimensions.length > 0) {
                            placeholders[0].items = [dimensions[0]];
                        }

                        if (dimensions.length > 1) {
                            placeholders[1].items = [dimensions[1]];
                        }

                        if (measures.length > 0) {
                            placeholders[2].items = [measures[0]];
                        }

                        break;
                    }

                    // When switching from PivotTable, the measurement is selected from the first two sections, and the indicator from the third
                    case 'pivotTable-line':
                    case 'pivotTable-area':
                    case 'pivotTable-area100p':
                    case 'pivotTable-scatter':
                    case 'pivotTable-column':
                    case 'pivotTable-column100p':
                    case 'pivotTable-bar':
                    case 'pivotTable-bar100p':
                    case 'pivotTable-pie':
                    case 'pivotTable-donut':
                    case 'pivotTable-treemap': {
                        const firstDimension = [
                            ...oldPlaceholders[0].items,
                            ...oldPlaceholders[1].items,
                        ].filter(
                            (item) => item.type !== 'PSEUDO' && item.data_type !== 'markup',
                        )[0];

                        const firstMeasure = oldPlaceholders[2].items[0];

                        placeholders[0].items = firstDimension ? [firstDimension] : [];
                        placeholders[1].items =
                            firstMeasure && firstMeasure.data_type !== 'markup'
                                ? [firstMeasure]
                                : [];
                        break;
                    }

                    // When switching to flatTable, all fields go to the first one
                    case 'pivotTable-flatTable':
                        placeholders[0].items = [
                            ...oldPlaceholders[0].items,
                            ...oldPlaceholders[1].items,
                            ...oldPlaceholders[2].items,
                        ].filter((item) => {
                            return item.type !== 'PSEUDO';
                        });

                        break;
                    case 'flatTable-flatTable':
                    case 'heatmap-geopoint':
                    case 'geopoint-heatmap':
                    case 'geopolygon-geopolygon':
                    case 'heatmap-heatmap':
                        placeholders[0].items = [...oldPlaceholders[0].items];

                        break;
                    case 'geopoint-geopoint':
                        placeholders[0].items = [...oldPlaceholders[0].items];
                        placeholders[1].items = [...oldPlaceholders[1].items];

                        break;
                    default:
                        if (placeholders.length) {
                            placeholders[0].items = [];
                        }
                }
            }

            const {shapes, shapesConfig, colorsConfig, colors, sort, labels, segments} =
                clearUnusedVisualizationItems({
                    visualization,
                    items: {
                        shapes: state.shapes,
                        shapesConfig: state.shapesConfig,
                        colors: prevColors,
                        colorsConfig: state.colorsConfig,
                        sort: state.sort,
                        labels: state.labels,
                        segments: state.segments,
                    },
                });

            // The condition is that during the first loading of the Map we did not clean the tooltips
            // Since right now tooltips are used only in Maps
            // The allowToltips flag is no longer used.
            // Therefore, it still needs to be checked for what it is in the visualization object.
            // Otherwise , its absence will result in a condition !visualization.allowToltips === true and we will clean the tooltips
            // The allowTooltips flag is relevant, if it is undefined, then it is not geo visualization
            // Therefore, checking for undefined is not necessary here
            if (
                (typeof visualization.allowToltips !== 'undefined' &&
                    !visualization.allowToltips) ||
                !(visualization as VisualizationLayerShared['visualization']).allowTooltips
            ) {
                tooltips = [];
            }

            if (colors.length) {
                colors.forEach((item: Field) => {
                    if (item.conflict) {
                        delete item.conflict;
                    }
                });
            }

            if (shapes.length) {
                shapes.forEach((item: Field) => {
                    if (item.conflict) {
                        delete item.conflict;
                    }
                });
            }

            if (labels.length) {
                const labelField = labels[0];
                if (
                    labelField.formatting &&
                    (labelField.formatting as CommonNumberFormattingOptions).labelMode ===
                        'percent' &&
                    !VISUALIZATION_WITH_LABEL_MODE.has(visualization.id as WizardVisualizationId)
                ) {
                    (labelField.formatting as CommonNumberFormattingOptions).labelMode = 'absolute';
                }
            }

            visualization.placeholders.forEach((placeholder: Placeholder) => {
                const onChange = (placeholder as any).onChange;

                if (onChange) {
                    onChange({placeholder, visualization, colors, shapes, sort});
                }

                if (isPlaceholderWithAxisMode(placeholder)) {
                    const axisModeMap = getPlaceholderAxisModeMap({
                        placeholder,
                        visualizationId: visualization.id as WizardVisualizationId,
                        sort,
                    });
                    placeholder.settings = Object.assign({}, placeholder.settings, {
                        axisModeMap,
                    });
                }
            });

            const onDesignItemsChange = (visualization as GraphShared['visualization'])
                .onDesignItemsChange;

            if (onDesignItemsChange) {
                onDesignItemsChange({
                    visualization: visualization as GraphShared['visualization'],
                    colors,
                    shapes,
                });
            }

            let updatedVisualization;

            if (isVisualizationWithLayers(action.visualization)) {
                updatedVisualization = {
                    ...action.visualization,
                    layers: action.visualization.layers.map((layer) => {
                        if (layer.layerSettings.id === (visualization as any).layerSettings.id) {
                            return visualization;
                        }

                        return layer;
                    }),
                } as VisualizationWithLayersShared['visualization'];

                if (action.visualization.id === 'combined-chart') {
                    updatedVisualization = updateCommonPlaceholders(updatedVisualization, {
                        colors,
                        shapes,
                    });
                }
            } else {
                updatedVisualization = visualization;
            }

            return {
                ...state,
                colors: [...colors],
                colorsConfig,
                shapes: [...shapes],
                shapesConfig,
                segments,
                geopointsConfig,
                sort,
                labels,
                tooltips,
                visualization: updatedVisualization as
                    | Shared['visualization']
                    | VisualizationWithLayersShared['visualization'],
            };
        }
        case SET_VISUALIZATION_PLACEHOLDER_ITEMS: {
            const {visualization, colors, shapes} = action;

            let updatedVisualization = visualization;

            if (visualization.id === 'combined-chart') {
                updatedVisualization = updateCommonPlaceholders(visualization, {
                    colors,
                    shapes,
                }) as Shared['visualization'];
            }

            return {
                ...state,
                colors,
                visualization: updatedVisualization,
                shapes,
            };
        }
        case UPDATE_PLACEHOLDER_SETTINGS: {
            const {settings, placeholderId} = action;

            let updatedVisualization = state.visualization;

            const placeholders = updatedVisualization?.placeholders || [];
            const placeholderToUpdateIndex = placeholders.findIndex((p) => p.id === placeholderId);

            if (placeholderToUpdateIndex >= 0 && placeholders[placeholderToUpdateIndex].settings) {
                updatedVisualization = update(updatedVisualization, {
                    placeholders: {[placeholderToUpdateIndex]: {settings: {$merge: settings}}},
                });
            }

            return {
                ...state,
                visualization: updatedVisualization,
            };
        }
        case SET_HIERARCHIES: {
            const {hierarchies} = action;

            let {visualization, colors} = state;

            if (visualization) {
                visualization = updateVisualizationHierarchies(
                    visualization as Shared['visualization'],
                    hierarchies,
                ) as Shared['visualization'];
                const updatedColorsAndVisualization = updateColorsHierarchies(
                    colors,
                    hierarchies,
                    visualization,
                );
                colors = updatedColorsAndVisualization.colors;
                visualization = updatedColorsAndVisualization.visualization;
            }

            return {
                ...state,
                hierarchies: hierarchies,
                visualization,
                colors,
            };
        }
        case SET_FILTERS: {
            const {filters} = action;

            return {
                ...state,
                filters: [...filters],
            };
        }
        case SET_SORT: {
            const {sort} = action;
            const visualization = updateCommonPlaceholders(
                state.visualization,
                {sort},
                {updateAllLayers: true},
            );
            const layers =
                (visualization as VisualizationWithLayersShared['visualization'] | undefined)
                    ?.layers || state.layers;

            return {
                ...state,
                visualization,
                layers,
                sort: [...sort],
            };
        }
        case UPDATE_LAYERS: {
            const {layers} = action;

            return {
                ...state,
                layers,
                visualization: {
                    ...(state.visualization as VisualizationWithLayersShared['visualization']),
                    layers,
                },
            };
        }
        case SET_SELECTED_LAYER_ID: {
            const {layerId} = action;

            return {
                ...state,
                visualization: {
                    ...(state.visualization as VisualizationWithLayersShared['visualization']),
                    selectedLayerId: layerId,
                },
            };
        }

        case SET_COLORS_CONFIG: {
            const {colorsConfig} = action;

            const visualization = updateCommonPlaceholders(state.visualization, {colorsConfig});
            const layers =
                (visualization as VisualizationWithLayersShared['visualization'] | undefined)
                    ?.layers || state.layers;

            return {
                ...state,
                visualization,
                layers,
                colorsConfig: {...colorsConfig},
            };
        }
        case SET_POINTS_SIZE_CONFIG: {
            const {geopointsConfig} = action;

            const visualization = updateCommonPlaceholders(state.visualization, {geopointsConfig});
            const layers =
                (visualization as VisualizationWithLayersShared['visualization'] | undefined)
                    ?.layers || state.layers;

            return {
                ...state,
                visualization,
                layers,
                geopointsConfig: {...geopointsConfig},
            };
        }
        case SET_LABELS: {
            const {labels = []} = action;

            const visualization = updateCommonPlaceholders(state.visualization, {labels});
            const layers =
                (visualization as VisualizationWithLayersShared['visualization'] | undefined)
                    ?.layers || state.layers;

            return {
                ...state,
                visualization,
                layers,
                labels: [...labels],
            };
        }
        case SET_TOOLTIPS: {
            const {tooltips = []} = action;

            const visualization = updateCommonPlaceholders(state.visualization, {tooltips});
            const layers =
                (visualization as VisualizationWithLayersShared['visualization'] | undefined)
                    ?.layers || state.layers;

            return {
                ...state,
                visualization,
                layers,
                tooltips: [...tooltips],
            };
        }
        case SET_COLORS: {
            const {visualization} = state;
            const {colors} = action;

            if (
                !visualization ||
                visualization?.allowColors ||
                isVisualizationWithLayers(visualization)
            ) {
                const updatedVisualization = updateCommonPlaceholders(visualization, {colors});
                const layers =
                    (
                        updatedVisualization as
                            | VisualizationWithLayersShared['visualization']
                            | undefined
                    )?.layers || state.layers;

                return {
                    ...state,
                    visualization: updatedVisualization,
                    layers,
                    colors: [...colors],
                };
            } else {
                return {
                    ...state,
                    colors: [],
                };
            }
        }
        case SET_AVAILABLE: {
            const {available} = action;

            return {
                ...state,
                available: [...available],
            };
        }
        case SET_DISTINCTS: {
            const {distincts} = action;

            return {
                ...state,
                distincts: {...distincts},
            };
        }
        case SET_LAYER_FILTERS: {
            const {filters} = action;

            const visualization = updateCommonPlaceholders(state.visualization, {filters});

            return {
                ...state,
                visualization,
            };
        }
        case SET_SHAPES: {
            const {shapes} = action;

            const visualization = updateCommonPlaceholders(state.visualization, {shapes});
            const layers =
                (visualization as VisualizationWithLayersShared['visualization'] | undefined)
                    ?.layers || state.layers;

            return {...state, shapes: [...shapes], visualization, layers};
        }
        case SET_SHAPES_CONFIG: {
            const {shapesConfig} = action;

            const visualization = updateCommonPlaceholders(state.visualization, {shapesConfig});
            const layers =
                (visualization as VisualizationWithLayersShared['visualization'] | undefined)
                    ?.layers || state.layers;

            return {...state, shapesConfig: {...shapesConfig}, visualization, layers};
        }
        case SET_DASHBOARD_PARAMETERS: {
            const {dashboardParameters} = action;

            return {
                ...state,
                dashboardParameters,
            };
        }
        case SET_SEGMENTS: {
            const {segments} = action;

            return {...state, segments};
        }

        case SET_DRILL_DOWN_LEVEL: {
            const {drillDownLevel} = action;

            return {
                ...state,
                drillDownLevel,
            };
        }
        default:
            return state;
    }
}

function updatePlaceholderHierarchies(
    placeholder: Placeholder,
    hierarchiesDict: Record<string, HierarchyField>,
) {
    return {
        ...placeholder,
        items: placeholder.items.reduce((acc: Field[], placeholderItem: Field) => {
            if (placeholderItem.data_type !== DATASET_FIELD_TYPES.HIERARCHY) {
                acc.push(placeholderItem);
                return acc;
            }

            const newPlaceholderItem = hierarchiesDict[placeholderItem.guid];

            if (newPlaceholderItem) {
                acc.push(newPlaceholderItem);
                return acc;
            }

            return acc;
        }, []),
    };
}

export function updateVisualizationHierarchies(
    visualization: Shared['visualization'],
    hierarchies: HierarchyField[],
): Shared['visualization'] {
    const hierarchiesDict = hierarchies.reduce((acc: Record<string, HierarchyField>, el) => {
        acc[el.guid] = el;
        return acc;
    }, {});

    let updatedVisualization = visualization;

    if (isVisualizationWithLayers(visualization)) {
        updatedVisualization = {
            ...visualization,
            layers: visualization.layers.map((layer) => {
                return {
                    ...layer,
                    placeholders: layer.placeholders.map((placeholder) =>
                        updatePlaceholderHierarchies(placeholder, hierarchiesDict),
                    ),
                };
            }),
        };
    }

    const placeholders =
        visualization.placeholders &&
        (visualization.placeholders as Placeholder[]).map((placeholder: Placeholder) => {
            return updatePlaceholderHierarchies(placeholder, hierarchiesDict);
        });

    return {
        ...updatedVisualization,
        placeholders,
    } as Shared['visualization'];
}

function updateCommonPlaceholders(
    visualization:
        | Shared['visualization']
        | VisualizationWithLayersShared['visualization']
        | undefined,
    update: {
        shapes?: Field[];
        filters?: FilterField[];
        colors?: Field[];
        labels?: Field[];
        tooltips?: Field[];
        sort?: Sort[];
        geopointsConfig?: object;
        colorsConfig?: TableShared['colorsConfig'];
        shapesConfig?: ShapesConfig;
    },
    options?: {updateAllLayers?: boolean},
) {
    if (!isVisualizationWithLayers(visualization)) {
        return visualization;
    }
    const layers = visualization.layers.map((layer, index) => {
        if (
            options?.updateAllLayers ||
            layer.layerSettings.id === visualization.selectedLayerId ||
            (index === 0 && !visualization.selectedLayerId)
        ) {
            return {
                ...layer,
                commonPlaceholders: {
                    ...layer.commonPlaceholders,
                    ...update,
                },
            };
        }

        return layer;
    });

    return {
        ...visualization,
        layers,
    } as Shared['visualization'];
}
