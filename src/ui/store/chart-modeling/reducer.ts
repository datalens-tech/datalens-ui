import type {PayloadAction} from '@reduxjs/toolkit';
import {createSlice} from '@reduxjs/toolkit';

import type {ChartModelingState, ChartWidgetState} from './typings';

const initialState: ChartModelingState = {
    editingWidgetId: undefined,
    widgets: {},
};

/* eslint-disable no-param-reassign */
export const chartModelingSlice = createSlice({
    name: 'chart-modeling',
    initialState,
    reducers: {
        openChartModelingDialog: (
            state,
            action: PayloadAction<{id: string; widgetName?: string}>,
        ) => {
            const {id: widgetId, widgetName} = action.payload;
            state.editingWidgetId = widgetId;

            if (!state.widgets[widgetId]) {
                state.widgets[widgetId] = {};
            }

            if (widgetName) {
                state.widgets[widgetId].widgetName = widgetName;
            }
        },
        closeChartModelingDialog: (state) => {
            state.editingWidgetId = undefined;
        },
        updateChartSettings: (
            state,
            action: PayloadAction<{id: string; settings: ChartWidgetState}>,
        ) => {
            const {id: widgetId, settings} = action.payload;
            const prev = {...state.widgets[widgetId]};

            state.widgets[widgetId] = {...prev, ...settings};
        },
        removeChartSettings: (state, action: PayloadAction<{id: string}>) => {
            const {id: widgetId} = action.payload;

            if (state.editingWidgetId === widgetId) {
                state.editingWidgetId = undefined;
            }

            delete state.widgets[widgetId];
        },
    },
});
/* eslint-enable no-param-reassign */

export const chartModelingReducer = chartModelingSlice.reducer;
