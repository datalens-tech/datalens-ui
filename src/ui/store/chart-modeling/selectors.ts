import {createSelector} from 'reselect';
import type {DatalensGlobalState} from 'ui';

const selectState = (state: DatalensGlobalState) => state.chartModeling;

export const selectIsChartModelingSettingOpen = createSelector(selectState, (state) => state.open);
