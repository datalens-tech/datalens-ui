import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import {BasicParameters} from '../../../types';

const initialState: BasicParameters = {};

export const parametersSelectorsSlice = createSlice({
    name: 'experimental/dash/parameters/selectors',
    initialState,
    reducers: {
        add: (state, action: PayloadAction<BasicParameters>) => {
            return {...state, ...action.payload};
        },
    },
});
