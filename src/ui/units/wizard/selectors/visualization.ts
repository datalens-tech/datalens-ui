import {createSelector} from 'reselect';
import type {Field, Shared} from 'shared';
import type {DatalensGlobalState} from 'ui';
import {selectDimensionsByDataset} from 'units/wizard/selectors/dataset';
import {getVisualization} from 'units/wizard/utils/helpers';

export const selectHierarchies = (state: DatalensGlobalState) =>
    state.wizard.visualization.hierarchies;

export const selectVisualization = (state: DatalensGlobalState) =>
    state.wizard.visualization.visualization!;

export const selectFilters = (state: DatalensGlobalState) => state.wizard.visualization.filters;

export const selectColors = (state: DatalensGlobalState) => state.wizard.visualization.colors;

export const selectColorsConfig = (state: DatalensGlobalState) =>
    state.wizard.visualization.colorsConfig;

export const selectSort = (state: DatalensGlobalState) => state.wizard.visualization.sort;

export const selectLabels = (state: DatalensGlobalState) => state.wizard.visualization.labels;

export const selectTooltips = (state: DatalensGlobalState) => state.wizard.visualization.tooltips;

export const selectSegments = (state: DatalensGlobalState) => state.wizard.visualization.segments;

export const selectPointSizeConfig = (state: DatalensGlobalState) =>
    state.wizard.visualization.geopointsConfig;

export const selectShapes = (state: DatalensGlobalState) => state.wizard.visualization.shapes;

export const selectShapesConfig = (state: DatalensGlobalState) =>
    state.wizard.visualization.shapesConfig;

export const selectAvailable = (state: DatalensGlobalState) => state.wizard.visualization.available;

export const selectDistincts = (state: DatalensGlobalState) => state.wizard.visualization.distincts;

export const selectSubVisualization = createSelector(
    selectVisualization,
    (globalVisualization: Shared['visualization'] | undefined) => {
        return getVisualization(globalVisualization);
    },
);

export const selectHierarchyEditorData = (state: DatalensGlobalState) => {
    const dimensionsByDataset = selectDimensionsByDataset(state);

    const {hierarchy, visible} = state.wizard.hierarchyEditor;

    const datasetId = hierarchy?.fields[0]?.datasetId || state.wizard.dataset.datasetId;

    let fields: Field[];

    if (datasetId && datasetId in dimensionsByDataset) {
        fields = Object.values(dimensionsByDataset[datasetId]);
    } else {
        fields = [];
    }

    return {hierarchy, visible, fields};
};

export const selectDashboardParameters = (state: DatalensGlobalState) =>
    state.wizard.visualization.dashboardParameters;
export const selectDrillDownLevel = (state: DatalensGlobalState) =>
    state.wizard.visualization.drillDownLevel;
