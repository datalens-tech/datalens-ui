import {createSelector, createStructuredSelector} from 'reselect';
import type {Update} from 'shared';
import type {DatalensGlobalState} from 'ui';
import {selectInitialDescription, selectWidgetHash} from 'units/wizard/selectors/widget';

import type {ConfigDataState} from '../reducers/preview';
import {getConfigData} from '../reducers/utils/getConfigData';

export const selectPreviewEntryId = (state: DatalensGlobalState) =>
    state.wizard.preview.previewEntryId;

export const selectConfigType = (state: DatalensGlobalState) => state.wizard.preview.configType;

export const selectPreviewHash = (state: DatalensGlobalState) => state.wizard.preview.hash;

export const selectHighchartsWidget = (state: DatalensGlobalState) =>
    state.wizard.preview.highchartsWidget;

export const selectIsLoading = (state: DatalensGlobalState) => state.wizard.preview.isLoading;

export const selectConfig = (state: DatalensGlobalState) => state.wizard.preview.config;

const selectPreviewColors = (state: DatalensGlobalState) => state.wizard.preview.colors;
const selectPreviewColorsConfig = (state: DatalensGlobalState) => state.wizard.preview.colorsConfig;
const selectPreviewExtraSettings = (state: DatalensGlobalState) =>
    state.wizard.preview.extraSettings || {};
const selectPreviewFilters = (state: DatalensGlobalState) => state.wizard.preview.filters;
const selectPreviewGeopointsConfig = (state: DatalensGlobalState) =>
    state.wizard.preview.geopointsConfig;
const selectPreviewHierarchies = (state: DatalensGlobalState) => state.wizard.preview.hierarchies;
const selectPreviewLabels = (state: DatalensGlobalState) => state.wizard.preview.labels;
const selectPreviewLinks = (state: DatalensGlobalState) => state.wizard.preview.links;
const selectPreviewSort = (state: DatalensGlobalState) => state.wizard.preview.sort;
const selectPreviewTooltips = (state: DatalensGlobalState) => state.wizard.preview.tooltips;
const selectPreviewVisualization = (state: DatalensGlobalState) =>
    state.wizard.preview.visualization;
const selectPreviewShapes = (state: DatalensGlobalState) => state.wizard.preview.shapes;
const selectPreviewShapesConfig = (state: DatalensGlobalState) => state.wizard.preview.shapesConfig;
const selectPreviewSegments = (state: DatalensGlobalState) => state.wizard.preview.segments;
const selectPreviewDatasets = (state: DatalensGlobalState) => state.wizard.preview.datasets;

export const selectInitialPreviewHash = (state: DatalensGlobalState) =>
    state.wizard.preview.initialPreviewHash;

export const selectUpdates = (state: DatalensGlobalState) => state.wizard.preview.updates;

const createConfigDataSelector = createStructuredSelector<DatalensGlobalState, ConfigDataState>({
    colors: selectPreviewColors,
    colorsConfig: selectPreviewColorsConfig,
    extraSettings: selectPreviewExtraSettings,
    filters: selectPreviewFilters,
    geopointsConfig: selectPreviewGeopointsConfig,
    hierarchies: selectPreviewHierarchies,
    labels: selectPreviewLabels,
    links: selectPreviewLinks,
    sort: selectPreviewSort,
    tooltips: selectPreviewTooltips,
    updates: selectUpdates,
    visualization: selectPreviewVisualization,
    shapes: selectPreviewShapes,
    shapesConfig: selectPreviewShapesConfig,
    segments: selectPreviewSegments,
    datasets: selectPreviewDatasets,
});

const selectConfigData = (state: DatalensGlobalState) => createConfigDataSelector(state);

// need separate selectors on each filed in deps to prevent rerender when state.wizard.preview changed
export const selectConfigForSaving = createSelector(selectConfigData, (previewState) => {
    return {
        shared: getConfigData(previewState),
    };
});

export const selectPreviewDescription = (state: DatalensGlobalState): string =>
    state.wizard.preview.description ?? state.wizard.widget.widget?.annotation?.description ?? '';

export const selectIsDescriptionChanged = createSelector(
    [selectInitialDescription, selectPreviewDescription],
    (initialDescription, previewDescription) => initialDescription !== previewDescription,
);

export const selectIsChartSaved = createSelector(
    selectPreviewHash,
    selectInitialPreviewHash,
    selectWidgetHash,
    selectIsDescriptionChanged,
    (previewHash: string, initialPreviewHash: string, widgetHash: string, isDescriptionChanged) => {
        return (
            (previewHash === initialPreviewHash || previewHash === widgetHash) &&
            !isDescriptionChanged
        );
    },
);

export const selectUpdatesByFieldId = createSelector(
    [selectUpdates, (_state: DatalensGlobalState, fieldId: string) => fieldId],
    (updates: Update[], fieldId: string) =>
        updates.filter((update) => update.field.guid === fieldId),
);
