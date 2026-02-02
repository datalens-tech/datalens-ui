import {createSelector} from 'reselect';
import type {DatalensGlobalState} from 'ui';

const selectState = (state: DatalensGlobalState) => state.chartModeling;

export const getEditingWidgetId = createSelector(selectState, (state) => state.editingWidgetId);

const getWidgetId = (_state: DatalensGlobalState, widgetId: string | undefined) => widgetId;

export const getChartModelingState = createSelector(selectState, getWidgetId, (state, widgetId) => {
    return widgetId ? state.widgets[widgetId] : {};
});

export const getIsChartModelingViewOpen = createSelector(getEditingWidgetId, (widgetId) => {
    return Boolean(widgetId);
});
