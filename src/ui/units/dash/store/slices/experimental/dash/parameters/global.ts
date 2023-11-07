import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import {BasicParameters} from '../../../types';

const initialState: BasicParameters = {};

export const parametersGlobalSlice = createSlice({
    name: 'experimental/dash/parameters/global',
    initialState,
    reducers: {
        update: (_, action: PayloadAction<BasicParameters>) => {
            return action.payload;
        },
    },
});
