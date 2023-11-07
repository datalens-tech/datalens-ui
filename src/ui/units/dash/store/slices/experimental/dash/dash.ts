import {combineReducers} from 'redux';

import {parametersGlobalSlice} from './parameters/global';
import {parametersSelectorsSlice} from './parameters/selectors';

const parameters = combineReducers({
    global: parametersGlobalSlice.reducer,
    selectors: parametersSelectorsSlice.reducer,
});

export const dash = combineReducers({parameters});
