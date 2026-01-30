import type {PayloadAction} from '@reduxjs/toolkit';
import {createSlice} from '@reduxjs/toolkit';

import type {ChartModelingState} from './typings';

const initialState: ChartModelingState = {
    open: false,
};

/* eslint-disable no-param-reassign */
export const chartModelingSlice = createSlice({
    name: 'chart-modeling',
    initialState,
    reducers: {
        setOpen: (state, action: PayloadAction<boolean>) => {
            state.open = action.payload;
        },
    },
});
/* eslint-enable no-param-reassign */

export const chartModelingReducer = chartModelingSlice.reducer;
