import type {AuthAction} from '../actions';
import {RESET_AUTH_STATE} from '../constants';
import type {AuthState} from '../types';

import {authReducer} from './auth';

export const reducer = (state: AuthState, action: AuthAction) => {
    if (action.type === RESET_AUTH_STATE) {
        return authReducer(undefined, action);
    }
    return authReducer(state, action);
};
