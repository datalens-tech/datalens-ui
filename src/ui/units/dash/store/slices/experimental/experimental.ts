import {combineReducers} from 'redux';

import {dash} from './dash/dash';

export const experimental = combineReducers({dash});

export type ExperimentalState = typeof experimental;
