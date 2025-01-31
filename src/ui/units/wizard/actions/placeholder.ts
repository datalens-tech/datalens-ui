import type {
    Field,
    FilterField,
    GraphShared,
    Placeholder,
    PlaceholderSettings,
    ServerChartsConfig,
    Shared,
    VisualizationLayerShared,
} from 'shared';
import {
    Feature,
    PlaceholderId,
    SortDirection,
    WizardVisualizationId,
    isMeasureField,
    isNumberField,
    isPercentVisualization,
    isTreeField,
    isVisualizationWithLayers,
} from 'shared';
import {isChartSupportMultipleColors} from 'shared/modules/colors/common-helpers';
import type {ApplyData, DatalensGlobalState} from 'ui';
import {
    getAxisModePlaceholderSettings,
    getFirstFieldInPlaceholder,
} from 'ui/units/wizard/utils/placeholder';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {SETTINGS} from '../../../constants/visualizations';
import type {AppDispatch} from '../../../store';
import {getChartType} from '../../ql/store/reducers/ql';
import {
    selectDashboardParameters,
    selectDrillDownLevel,
    selectFilters,
    selectSubVisualization,
    selectVisualization,
} from '../selectors/visualization';
import {getExistedParameterKeys, removeUrlParameters} from '../utils/wizard';

import {openWizardDialogFilter} from './dialog';
import {PlaceholderAction} from './dndItems';
import {updatePreviewAndClientChartsConfig} from './preview';
import {
    setAvailable,
    setColors,
    setColorsConfig,
    setDashboardParameters,
    setDrillDownLevel,
    setFilters,
    setLabels,
    setLayerFilters,
    setSegments,
    setShapes,
    setShapesConfig,
    setSort,
    setTooltips,
    updateLayers,
    updatePlaceholderSettings,
} from './visualization';
import {forceDisableTotalsAndPagination} from './widget';

import {setVisualization, setVisualizationPlaceholderItems} from './index';

type CommonUpdatePlaceholderOptions = {
    item?: Field;
    action?: PlaceholderAction;
    onUndoInsert?: () => void;
    placeholderId?: PlaceholderId;
};

type CommonUpdatePlaceholderArgs = {
    items: Field[];
    options?: CommonUpdatePlaceholderOptions;
};

export const updatePlaceholderSettingsAction = (
    sectionFields: Field[],
    currentSectionField: Field | undefined,
    options: {
        placeholder: Placeholder;
        visualization: Shared['visualization'];
    },
) => {
    return function (dispatch: AppDispatch, getState: () => DatalensGlobalState) {
        const {placeholder, visualization} = options;
        const updatedPlaceholderSettings: PlaceholderSettings = {};
        const firstFieldInSection = sectionFields[0];

        if (
            currentSectionField &&
            firstFieldInSection &&
            currentSectionField.guid !== firstFieldInSection.guid
        ) {
            return;
        }

        if (
            (isPercentVisualization(visualization.id) || !isNumberField(firstFieldInSection)) &&
            placeholder.settings?.axisFormatMode
        ) {
            updatedPlaceholderSettings.axisFormatMode = SETTINGS.AXIS_FORMAT_MODE.AUTO;
        }

        const chartConfig = getState().wizard.visualization as Partial<ServerChartsConfig>;
        const axisModeSettings = getAxisModePlaceholderSettings({
            placeholder,
            chartConfig,
            firstField: firstFieldInSection,
        });

        dispatch(setDrillDownLevel({drillDownLevel: 0}));

        dispatch(
            updatePlaceholderSettings(placeholder.id as PlaceholderId, {
                ...updatedPlaceholderSettings,
                ...axisModeSettings,
            }),
        );
    };
};

export function updateAvailable(args: CommonUpdatePlaceholderArgs) {
    return function (dispatch: AppDispatch) {
        dispatch(setAvailable({available: args.items}));
    };
}
export function updateColors(args: CommonUpdatePlaceholderArgs) {
    return function (dispatch: AppDispatch, getState: () => DatalensGlobalState) {
        const {visualization: currentVisualization} = getState().wizard.visualization;

        if (currentVisualization?.placeholders.some((p) => p.id === PlaceholderId.Colors)) {
            dispatch(updateVisualizationPlaceholderItems(args));
        } else {
            const newVisualization = {...currentVisualization} as GraphShared['visualization'];
            const onDesignItemsChange = newVisualization.onDesignItemsChange;
            const {items} = args;

            let updatedColors;
            if (onDesignItemsChange) {
                const chartType = getChartType(getState()) ?? '';
                const isMultipleColorsSupported =
                    isEnabledFeature(Feature.MultipleColorsInVisualization) &&
                    isChartSupportMultipleColors(chartType, newVisualization.id);
                const prevColors = getState().wizard.preview.colors;
                updatedColors = onDesignItemsChange({
                    colors: items,
                    prevColors: prevColors,
                    isMultipleColorsSupported,
                    // onDesignItemsChange is mutating visualization
                    // That's why we are setting new visualization below
                    visualization: newVisualization,
                }).colors;
            } else {
                updatedColors = items;
            }

            dispatch(setVisualization({visualization: newVisualization}));

            dispatch(
                setColors({
                    colors: updatedColors,
                }),
            );
        }

        dispatch(
            setColorsConfig({
                colorsConfig: {},
            }),
        );
    };
}
export function updateSegments(args: CommonUpdatePlaceholderArgs) {
    return function (dispatch: AppDispatch, getState: () => DatalensGlobalState) {
        const {items} = args;
        const state = getState();
        const visualizationState = state.wizard.visualization;
        const visualization = visualizationState.visualization;

        if (!visualization) {
            return;
        }

        if (items.length) {
            const placeholders = visualization.placeholders;
            const yPlaceholder = placeholders.find((p) => p.id === PlaceholderId.Y);
            const y2Placeholder = placeholders.find((p) => p.id === PlaceholderId.Y2);

            if (yPlaceholder) {
                yPlaceholder.settings = {
                    ...yPlaceholder.settings,
                    title: SETTINGS.TITLE.AUTO,
                };
            }

            if (y2Placeholder) {
                y2Placeholder.settings = {
                    ...y2Placeholder.settings,
                    title: SETTINGS.TITLE.AUTO,
                };
            }
        }

        dispatch(setSegments({segments: items}));
    };
}
export function updateShapes(args: CommonUpdatePlaceholderArgs) {
    return function (dispatch: AppDispatch, getState: () => DatalensGlobalState) {
        const {items} = args;
        const visualizationState = getState().wizard.visualization;
        const visualization = visualizationState.visualization;

        const onDesignItemsChange = (visualization as GraphShared['visualization'])
            ?.onDesignItemsChange;

        const visualizationCopy = {...visualization} as Shared['visualization'];

        let updatedShapes;
        if (onDesignItemsChange) {
            updatedShapes = onDesignItemsChange({
                shapes: items,
                // onDesignItemsChange is mutating visualization
                // That's why we are setting new visualization below
                visualization: visualizationCopy as GraphShared['visualization'],
            }).shapes;
        } else {
            updatedShapes = items;
        }
        dispatch(setVisualization({visualization: visualizationCopy}));
        dispatch(setShapesConfig({shapesConfig: {}}));
        dispatch(setShapes({shapes: updatedShapes}));
    };
}
export function updateSort(args: CommonUpdatePlaceholderArgs) {
    return function (dispatch: AppDispatch, getState: () => DatalensGlobalState) {
        const {items} = args;
        const state = getState();
        const visualization = selectVisualization(state);
        const drillDownLevel = selectDrillDownLevel(state);

        if (!visualization) {
            return;
        }

        const isSortHasMeasureField = items.some(isMeasureField);
        const validateXPlaceholderAxisMode = (
            placeholder: Placeholder,
            visualizationId: string,
        ) => {
            const settings: PlaceholderSettings = placeholder.settings || {};
            const firstField = getFirstFieldInPlaceholder(placeholder, drillDownLevel);
            return (
                firstField &&
                settings.axisModeMap &&
                settings.axisModeMap[firstField.guid] &&
                isSortHasMeasureField &&
                visualizationId !== WizardVisualizationId.Area
            );
        };

        if (isVisualizationWithLayers(visualization)) {
            visualization.layers.forEach((layer) => {
                const xPlaceholder = layer.placeholders.find((p) => p.id === PlaceholderId.X);

                if (xPlaceholder && validateXPlaceholderAxisMode(xPlaceholder, visualization.id)) {
                    const firstField = getFirstFieldInPlaceholder(xPlaceholder, drillDownLevel);
                    (xPlaceholder.settings as PlaceholderSettings).axisModeMap![firstField.guid] =
                        SETTINGS.AXIS_MODE.DISCRETE;
                }
            });
        } else {
            const xPlaceholder = visualization.placeholders.find((p) => p.id === PlaceholderId.X);

            if (xPlaceholder && validateXPlaceholderAxisMode(xPlaceholder, visualization.id)) {
                const firstField = getFirstFieldInPlaceholder(xPlaceholder, drillDownLevel);
                (xPlaceholder.settings as PlaceholderSettings).axisModeMap![firstField.guid] =
                    SETTINGS.AXIS_MODE.DISCRETE;
            }
        }

        const sort = items.map((item) => ({
            ...item,
            direction: item.direction || SortDirection.DESC,
        }));

        dispatch(setSort({sort}));
    };
}
export function updateLabels(args: CommonUpdatePlaceholderArgs) {
    return function (dispatch: AppDispatch) {
        dispatch(setLabels({labels: args.items}));
    };
}
export function updateTooltips(args: CommonUpdatePlaceholderArgs) {
    return function (dispatch: AppDispatch) {
        dispatch(setTooltips({tooltips: args.items}));
    };
}
export function updateFilters(args: CommonUpdatePlaceholderArgs) {
    return function (dispatch: AppDispatch, getState: () => DatalensGlobalState) {
        const {items, options} = args;
        const item = options?.item;
        const action = options?.action;
        const filters = selectFilters(getState());
        const filtersFromDashboard = filters.filter((filter) => filter.unsaved);

        const filterItem = options?.item || items[items.length - 1];
        if (action === PlaceholderAction.Remove) {
            // Handling filter remove by user
            const newFilters = filters.filter(
                (filter) => (filter as unknown as Field) !== item,
            ) as FilterField[];

            dispatch(setFilters({filters: newFilters}));

            return;
        }

        if (item && item.filter) {
            // Handling filter from dashboard move by user
            if (item.unsaved) {
                delete item.unsaved;

                removeUrlParameters([item.guid]);
            }

            const newFilters = items.concat(
                filtersFromDashboard.filter((filter) => filter !== item),
            ) as FilterField[];

            dispatch(setFilters({filters: newFilters}));

            return;
        }

        const onDialogFilterAction = (data: ApplyData) => {
            // Filter modal submitted
            const result = {
                ...filterItem,
                filter: {
                    value: data.values,
                    operation: {code: data.operation},
                },
            };
            const newFilters = [
                ...items
                    .filter((filter) => !filter.unsaved)
                    .map((filter) => (filter === filterItem ? result : filter)),
                ...filtersFromDashboard.filter((dashboardFilter) => {
                    return dashboardFilter.guid !== result.guid;
                }),
            ] as FilterField[];

            const keys = getExistedParameterKeys({
                possibleKeys: [result.guid, result.title],
            });

            removeUrlParameters(keys);
            dispatch(setFilters({filters: newFilters}));
            dispatch(updatePreviewAndClientChartsConfig({}));
        };
        dispatch(
            openWizardDialogFilter({
                filterItem,
                onDialogFilterApply: onDialogFilterAction,
                onDialogFilterCancel: () => {
                    // Filter modal canceled
                    if (action === PlaceholderAction.Insert) {
                        items.splice(items.indexOf(filterItem), 1);
                    }

                    if (options?.onUndoInsert) {
                        options.onUndoInsert();
                    }
                },
            }),
        );
    };
}
export function updateDashboardFilters(args: CommonUpdatePlaceholderArgs) {
    return function (dispatch: AppDispatch, getState: () => DatalensGlobalState) {
        const {options} = args;
        const filterItem = options?.item;
        const action = options?.action;
        const state = getState();
        const filters = selectFilters(state);
        const visualization = selectVisualization(state);

        if (action === PlaceholderAction.Remove) {
            // Handling filter remove by user
            const newFilters = filters.filter((filter) => {
                if (filter.unsaved && (filter as any) === filterItem) {
                    const keys = getExistedParameterKeys({
                        possibleKeys: [filter.guid, filter.title],
                    });
                    removeUrlParameters(keys);
                    return false;
                }

                if (filter.disabled && filter.guid === filterItem?.guid) {
                    delete filter.disabled;
                }

                return true;
            });

            if (isVisualizationWithLayers(visualization)) {
                const updatedLayers = [...visualization.layers];
                updatedLayers.forEach((layer) => {
                    layer.commonPlaceholders.filters = layer.commonPlaceholders.filters.filter(
                        (filter) => {
                            if (filter.unsaved && filter.guid === filterItem?.guid) {
                                return false;
                            }

                            if (filter.disabled && filter.guid === filterItem?.guid) {
                                delete filter.disabled;
                            }

                            return true;
                        },
                    );
                });

                dispatch(updateLayers({layers: updatedLayers}));
            }

            dispatch(setFilters({filters: newFilters}));
        }
    };
}
export function updateLayerFilters(args: CommonUpdatePlaceholderArgs) {
    return function (dispatch: AppDispatch, getState: () => DatalensGlobalState) {
        const state = getState();
        const visualization = selectSubVisualization(
            state,
        ) as VisualizationLayerShared['visualization'];
        const filters = selectFilters(state);
        const filtersFromDashboard = filters.filter((filter) => filter.unsaved);

        const items = args.items as FilterField[];
        const options = args.options;
        const item = options?.item as FilterField | undefined;
        const layerFilters = visualization.commonPlaceholders.filters;
        const filterItem = item || items[items.length - 1];
        if (options?.action === 'remove') {
            const newFilters = layerFilters.filter((filter: any) => filter !== item);

            dispatch(setLayerFilters({filters: newFilters}));
            return;
        }
        if (item?.filter) {
            if (item.unsaved) {
                delete item.unsaved;
            }
            const newFilters = items.concat(
                filtersFromDashboard.filter((filter) => filter !== item),
            );

            dispatch(setLayerFilters({filters: newFilters}));
            return;
        }
        const onDialogFilterAction = (data: ApplyData) => {
            // Filter modal submitted
            const result = {
                ...filterItem,
                filter: {
                    value: data.values,
                    operation: {code: data.operation},
                },
            };
            const newFilters = [...layerFilters, result] as FilterField[];

            dispatch(setLayerFilters({filters: newFilters}));
            dispatch(updatePreviewAndClientChartsConfig({}));
        };
        dispatch(
            openWizardDialogFilter({
                filterItem: filterItem as Field,
                onDialogFilterApply: onDialogFilterAction,
                onDialogFilterCancel: () => {
                    // Filter modal cancelled
                    if (options?.action === PlaceholderAction.Insert) {
                        items.splice(items.indexOf(filterItem), 1);
                    }

                    if (options?.onUndoInsert) {
                        options.onUndoInsert();
                    }
                },
            }),
        );
    };
}
export function updateDashboardParameters(args: CommonUpdatePlaceholderArgs) {
    return function (dispatch: AppDispatch, getState: () => DatalensGlobalState) {
        const {options} = args;
        const action = options?.action;
        const parameterItem = options?.item;

        const dashboardParameters = selectDashboardParameters(getState());
        if (action === 'remove') {
            const updatedParameters = dashboardParameters.filter((field: Field) => {
                if (field === parameterItem) {
                    const keys = getExistedParameterKeys({possibleKeys: [field.guid, field.title]});
                    removeUrlParameters(keys);
                    return false;
                }

                return true;
            });
            dispatch(setDashboardParameters({dashboardParameters: updatedParameters}));
        }
    };
}
export function updateVisualizationPlaceholderItems(args: CommonUpdatePlaceholderArgs) {
    return function (dispatch: AppDispatch, getState: () => DatalensGlobalState) {
        const {items, options} = args;

        const placeholderId = options?.placeholderId;

        if (!placeholderId) {
            return;
        }

        const state = getState();
        const visualization = selectSubVisualization(state) as Shared['visualization'];

        const currentPlaceholder = visualization?.placeholders.find((p) => p.id === placeholderId);

        if (!currentPlaceholder) {
            return;
        }

        const updatedState = getState();
        const updatedVisualization = selectSubVisualization(updatedState)!;
        const updatedPlaceholder = updatedVisualization?.placeholders.find(
            (p) => p.id === placeholderId,
        )!;

        if (updatedVisualization.id === 'flatTable' && items.some((field) => isTreeField(field))) {
            dispatch(forceDisableTotalsAndPagination());
        }

        dispatch(
            setVisualizationPlaceholderItems({
                visualization: updatedVisualization,
                placeholder: updatedPlaceholder,
                items,
            }),
        );

        dispatch(
            updatePlaceholderSettingsAction(items, options?.item, {
                placeholder: currentPlaceholder,
                visualization,
            }),
        );
    };
}
