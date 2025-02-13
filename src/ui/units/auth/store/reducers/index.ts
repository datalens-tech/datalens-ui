import {combineReducers} from 'redux';

import type {AuthAction} from '../actions';
import {RESET_AUTH_STATE} from '../constants/common';

import {commonReducer} from './common';
import {signinReducer} from './signin';
import {signupReducer} from './signup';
import {userProfileReducer} from './userProfile';

const reducers = combineReducers({
    common: commonReducer,
    signin: signinReducer,
    signup: signupReducer,
    userProfile: userProfileReducer,
});

export type AuthState = ReturnType<typeof reducers>;

export const reducer = (state: AuthState, action: AuthAction) => {
    if (action.type === RESET_AUTH_STATE) {
        return reducers(undefined, action);
    }
    return reducers(state, action);
};
