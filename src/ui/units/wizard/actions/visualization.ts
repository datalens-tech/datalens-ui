import type {
    Field,
    FilterField,
    HierarchyField,
    Placeholder,
    PlaceholderSettings,
    PointSizeConfig,
    ShapesConfig,
    Shared,
    Sort,
    TableShared,
    VisualizationWithLayersShared,
} from 'shared';
import {PlaceholderId, isFieldHierarchy} from 'shared';
import type {ApplyData, DatalensGlobalState} from 'ui';

import type {ColumnSettingsState} from '../components/Dialogs/DialogColumnSettings/hooks/useDialogColumnSettingsState';
import type {WizardDispatch} from '../reducers';

import type {SetHierarchiesAction} from './dataset';
import {setHierarchies} from './dataset';
import {openWizardDialogFilter} from './dialog';
import {updatePreviewAndClientChartsConfig} from './preview';

import {setVisualizationPlaceholderItems} from './index';

export const SET_VISUALIZATION = Symbol('wizard/visualization/SET_VISUALIZATION');
export const SET_VISUALIZATION_PLACEHOLDER_ITEMS = Symbol(
    'wizard/visualization/SET_VISUALIZATION_PLACEHOLDER_ITEMS',
);
export const SET_FILTERS = Symbol('wizard/visualization/SET_FILTERS');
export const SET_COLORS = Symbol('wizard/visualization/SET_COLORS');
export const SET_AVAILABLE = Symbol('wizard/visualization/SET_AVAILABLE');
export const SET_Y_AXIS_CONFLICT = Symbol('wizard/visualization/SET_Y_AXIS_CONFLICT');
export const SET_DISTINCTS = Symbol('wizard/visualization/SET_DISTINCTS');
export const SET_COLORS_CONFIG = Symbol('wizard/visualization/SET_COLORS_CONFIG');
export const SET_POINTS_SIZE_CONFIG = Symbol('wizard/visualization/SET_POINTS_SIZE_CONFIG');
export const SET_SORT = Symbol('wizard/visualization/SET_SORT');
export const SET_LABELS = Symbol('wizard/visualization/SET_LABELS');
export const SET_TOOLTIPS = Symbol('wizard/visualization/SET_TOOLTIPS');
export const SET_SELECTED_LAYER_ID = Symbol('wizard/visualization/SET_SELECTED_LAYER_ID');
export const SET_LAYER_FILTERS = Symbol('wizard/visualization/SET_LAYER_FILTERS');
export const UPDATE_LAYERS = Symbol('wizard/visualization/UPDATE_LAYERS');
export const SET_SHAPES = Symbol('wizard/visualization/SET_SHAPES');
export const SET_SHAPES_CONFIG = Symbol('wizard/visualization/SET_SHAPES_CONFIG');
export const SET_DASHBOARD_PARAMETERS = Symbol('wizard/visualization/SET_DASHBOARD_PARAMETERS');
export const SET_SEGMENTS = Symbol('wizard/visualization/SET_SEGMENTS');
export const UPDATE_PLACEHOLDER_SETTINGS = Symbol(
    'wizard/visualization/UPDATE_PLACEHOLDER_SETTINGS',
);
export const SET_DRILL_DOWN_LEVEL = Symbol('wizard/SET_DRILL_DOWN_LEVEL');

interface SetVisualizationAction extends SetVisualizationArgs {
    type: typeof SET_VISUALIZATION;
}

interface SetVisualizationArgs {
    visualization: Shared['visualization'];
    qlMode?: boolean;
}

export function _setVisualization({
    visualization,
    qlMode,
}: SetVisualizationArgs): SetVisualizationAction {
    return {
        type: SET_VISUALIZATION,
        qlMode,
        visualization,
    };
}

interface SetVisualizationPlaceholderItemsAction {
    type: typeof SET_VISUALIZATION_PLACEHOLDER_ITEMS;
    visualization: Shared['visualization'];
    colors: Field[];
    shapes: Field[];
}

export function _setVisualizationPlaceholderItems({
    visualization,
    colors,
    shapes,
}: {
    visualization: Shared['visualization'];
    colors: Field[];
    shapes: Field[];
}): SetVisualizationPlaceholderItemsAction {
    return {
        type: SET_VISUALIZATION_PLACEHOLDER_ITEMS,
        visualization,
        colors,
        shapes,
    };
}

interface SetFiltersAction {
    type: typeof SET_FILTERS;
    filters: FilterField[];
}

export function setFilters({filters}: {filters: FilterField[]}): SetFiltersAction {
    return {
        type: SET_FILTERS,
        filters,
    };
}

interface SetColorsAction {
    type: typeof SET_COLORS;
    colors: Field[];
}

export function setColors({colors}: {colors: Field[]}): SetColorsAction {
    return {
        type: SET_COLORS,
        colors,
    };
}

interface SetAvailableAction {
    type: typeof SET_AVAILABLE;
    available: Field[];
}

export function setAvailable({available}: {available: Field[]}): SetAvailableAction {
    return {
        type: SET_AVAILABLE,
        available,
    };
}

interface SetPointConflictAction {
    type: typeof SET_Y_AXIS_CONFLICT;
    pointConflict?: boolean;
}

export function setPointConflict({
    pointConflict,
}: {
    pointConflict?: boolean;
}): SetPointConflictAction {
    return {
        type: SET_Y_AXIS_CONFLICT,
        pointConflict,
    };
}

interface SetDistinctsAction {
    type: typeof SET_DISTINCTS;
    distincts: Record<string, string[]>;
}

export function setDistincts({
    distincts,
}: {
    distincts: Record<string, string[]>;
}): SetDistinctsAction {
    return {
        type: SET_DISTINCTS,
        distincts,
    };
}

interface SetColorsConfigAction {
    type: typeof SET_COLORS_CONFIG;
    colorsConfig: TableShared['colorsConfig'];
}

export function setColorsConfig({colorsConfig}: {colorsConfig: TableShared['colorsConfig']}) {
    return {
        type: SET_COLORS_CONFIG,
        colorsConfig,
    };
}

interface SetGeopointsConfigAction {
    type: typeof SET_POINTS_SIZE_CONFIG;
    geopointsConfig: PointSizeConfig;
}

export function setPointsSizeConfig({
    geopointsConfig,
}: {
    geopointsConfig: PointSizeConfig;
}): SetGeopointsConfigAction {
    return {
        type: SET_POINTS_SIZE_CONFIG,
        geopointsConfig,
    };
}

interface SetSortAction {
    type: typeof SET_SORT;
    sort: Sort[];
}

export function setSort({sort}: {sort: Sort[]}): SetSortAction {
    return {
        type: SET_SORT,
        sort,
    };
}

interface SetLabelsAction {
    type: typeof SET_LABELS;
    labels: Field[];
}

export function setLabels({labels}: {labels: Field[]}): SetLabelsAction {
    return {
        type: SET_LABELS,
        labels,
    };
}

interface SetTooltipsAction {
    type: typeof SET_TOOLTIPS;
    tooltips: Field[];
}

export function setTooltips({tooltips}: {tooltips: Field[]}): SetTooltipsAction {
    return {
        type: SET_TOOLTIPS,
        tooltips,
    };
}

interface UpdateLayersAction {
    type: typeof UPDATE_LAYERS;
    layers: VisualizationWithLayersShared['visualization']['layers'];
}

export function updateLayers({
    layers,
}: {
    layers: VisualizationWithLayersShared['visualization']['layers'];
}): UpdateLayersAction {
    return {
        type: UPDATE_LAYERS,
        layers,
    };
}

interface SetSelectedLayerIdAction {
    type: typeof SET_SELECTED_LAYER_ID;
    layerId: string;
}

export function _setSelectedLayerId({layerId}: {layerId: string}): SetSelectedLayerIdAction {
    return {
        type: SET_SELECTED_LAYER_ID,
        layerId,
    };
}

interface SetLayerFiltersAction {
    type: typeof SET_LAYER_FILTERS;
    filters: FilterField[];
}

export function setLayerFilters({filters}: {filters: FilterField[]}): SetLayerFiltersAction {
    return {
        type: SET_LAYER_FILTERS,
        filters,
    };
}

interface SetShapesAction {
    type: typeof SET_SHAPES;
    shapes: Field[];
}

export function setShapes({shapes}: {shapes: Field[]}): SetShapesAction {
    return {
        type: SET_SHAPES,
        shapes,
    };
}

interface SetShapesConfigAction {
    type: typeof SET_SHAPES_CONFIG;
    shapesConfig: ShapesConfig;
}

export function setShapesConfig({
    shapesConfig,
}: {
    shapesConfig: ShapesConfig;
}): SetShapesConfigAction {
    return {
        type: SET_SHAPES_CONFIG,
        shapesConfig,
    };
}

interface SetDashboardParametersAction {
    type: typeof SET_DASHBOARD_PARAMETERS;
    dashboardParameters: Field[];
}

export function setDashboardParameters({
    dashboardParameters,
}: {
    dashboardParameters: Field[];
}): SetDashboardParametersAction {
    return {
        type: SET_DASHBOARD_PARAMETERS,
        dashboardParameters,
    };
}

type SetSegmentsAction = {
    type: typeof SET_SEGMENTS;
    segments: Field[];
};

export function setSegments({segments}: {segments: Field[]}): SetSegmentsAction {
    return {
        type: SET_SEGMENTS,
        segments,
    };
}

type OnFilterItemClickArgs = {
    filterItem: Field;
    onApplyCallback?: (filterItem: Field, data: ApplyData) => void;
};

export function onFilterItemClick({filterItem, onApplyCallback}: OnFilterItemClickArgs) {
    return function (dispatch: WizardDispatch, getState: () => DatalensGlobalState) {
        let filters = getState().wizard.visualization.filters as unknown as Field[];

        const onDialogFilterAction = (data?: ApplyData) => {
            if (data) {
                const result = {
                    ...filterItem,
                    filter: {
                        value: data.values,
                        operation: {code: data.operation},
                    },
                };

                if (filterItem.disabled) {
                    filters = filters.filter((filter) => {
                        return !(filter === filterItem && filter.unsaved);
                    });

                    delete filterItem.disabled;
                }

                if (filters.some((filter) => filter === filterItem)) {
                    filters = filters.map((filter) => (filter === filterItem ? result : filter));
                } else {
                    filters = [...filters, result];
                }

                if (onApplyCallback && data) {
                    onApplyCallback(filterItem, data);
                }

                dispatch(setFilters({filters: filters as unknown as FilterField[]}));
                dispatch(updatePreviewAndClientChartsConfig({}));
            }
        };

        dispatch(
            openWizardDialogFilter({
                filterItem,
                onDialogFilterApply: onDialogFilterAction,
            }),
        );
    };
}

export function updateFieldColumnSettings(
    visualization: Shared['visualization'],
    placeholder: Placeholder,
    columnsSettings: {columns: ColumnSettingsState; rows: ColumnSettingsState},
    needRedraw: boolean,
) {
    return (dispatch: WizardDispatch, getState: () => DatalensGlobalState) => {
        const hiearchiesToUpdate: HierarchyField[] = [];

        const placeholderId = placeholder.id;
        let placeholderType: 'columns' | 'rows' | undefined;

        switch (placeholderId as PlaceholderId) {
            case PlaceholderId.PivotTableColumns:
            case PlaceholderId.FlatTableColumns:
                placeholderType = 'columns';
                break;
            case PlaceholderId.PivotTableRows:
                placeholderType = 'rows';
                break;
            default:
                placeholderType = undefined;
                break;
        }

        if (!placeholderType) {
            return;
        }

        const updatedItems: Field[] = placeholder.items.map((field) => {
            const updatedColumnSettings =
                columnsSettings[placeholderType as 'columns' | 'rows'][field.guid].columnSettings;

            if (isFieldHierarchy(field)) {
                const updatedHierarchyFields = field.fields.map((innerField) => ({
                    ...innerField,
                    columnSettings: {...field.columnSettings, ...updatedColumnSettings},
                }));

                const updatedHierarchy: HierarchyField = {
                    ...field,
                    fields: updatedHierarchyFields,
                };

                hiearchiesToUpdate.push(updatedHierarchy);

                return updatedHierarchy;
            }

            return {
                ...field,
                columnSettings: {
                    ...field.columnSettings,
                    ...updatedColumnSettings,
                },
            } as Field;
        });

        if (hiearchiesToUpdate.length) {
            const prevHierarchies = getState().wizard.visualization.hierarchies;
            const newHierarchies = prevHierarchies.map((item) => {
                const hierarchyToUpdate = hiearchiesToUpdate.find((h) => h.guid === item.guid);
                return hierarchyToUpdate || item;
            });
            dispatch(setHierarchies({hierarchies: newHierarchies}));
        }

        dispatch(
            setVisualizationPlaceholderItems({
                visualization,
                placeholder,
                items: updatedItems,
            }),
        );

        dispatch(
            updatePreviewAndClientChartsConfig({
                needRedraw,
            }),
        );
    };
}

type UpdatePlaceholderSettingsAction = {
    type: typeof UPDATE_PLACEHOLDER_SETTINGS;
    settings: Partial<PlaceholderSettings>;
    placeholderId: PlaceholderId;
};

export function updatePlaceholderSettings(
    placeholderId: PlaceholderId,
    settings: Partial<PlaceholderSettings>,
): UpdatePlaceholderSettingsAction {
    return {
        type: UPDATE_PLACEHOLDER_SETTINGS,
        settings,
        placeholderId,
    };
}

type SetDrillDownLevelAction = {
    type: typeof SET_DRILL_DOWN_LEVEL;
    drillDownLevel: number;
};

export function setDrillDownLevel({
    drillDownLevel,
}: {
    drillDownLevel: number;
}): SetDrillDownLevelAction {
    return {
        type: SET_DRILL_DOWN_LEVEL,
        drillDownLevel,
    };
}

export type VisualizationAction =
    | SetLayerFiltersAction
    | SetSelectedLayerIdAction
    | UpdateLayersAction
    | SetTooltipsAction
    | SetLabelsAction
    | SetSortAction
    | SetGeopointsConfigAction
    | SetColorsConfigAction
    | SetColorsAction
    | SetAvailableAction
    | SetPointConflictAction
    | SetDistinctsAction
    | SetFiltersAction
    | SetVisualizationPlaceholderItemsAction
    | SetVisualizationAction
    | SetHierarchiesAction
    | SetShapesAction
    | SetShapesConfigAction
    | SetDashboardParametersAction
    | SetSegmentsAction
    | UpdatePlaceholderSettingsAction
    | SetDrillDownLevelAction;
