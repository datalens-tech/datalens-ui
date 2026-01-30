import type {PayloadAction} from '@reduxjs/toolkit';
import {createSlice} from '@reduxjs/toolkit';

import type {ChartModelingState} from './typings';
import type {ChartStateSettings} from 'shared';

const initialState: ChartModelingState = {
    editingWidgetId: undefined,
    widgets: {},
};

/* eslint-disable no-param-reassign */
export const chartModelingSlice = createSlice({
    name: 'chart-modeling',
    initialState,
    reducers: {
        openChartModelingDialog: (state, action: PayloadAction<{id: string}>) => {
            state.editingWidgetId = action.payload.id;
        },
        closeChartModelingDialog: (state) => {
            state.editingWidgetId = undefined;
        },
        updateChartSettings: (
            state,
            action: PayloadAction<{id: string; settings: ChartStateSettings}>,
        ) => {
            const {id: widgetId, settings} = action.payload;
            const prev = {...state.widgets[widgetId]};

            state.widgets[widgetId] = {...prev, ...settings};
        },
    },
});
/* eslint-enable no-param-reassign */

export const chartModelingReducer = chartModelingSlice.reducer;
