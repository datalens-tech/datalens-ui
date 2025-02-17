import {combineReducers} from 'redux';

import type {AuthAction} from '../actions';
import {RESET_AUTH_STATE} from '../constants/common';

import {commonReducer} from './common';
import {signinReducer} from './signin';
import {userInfoFormReducer} from './userInfoForm';
import {userProfileReducer} from './userProfile';

const reducers = combineReducers({
    common: commonReducer,
    signin: signinReducer,
    userInfoForm: userInfoFormReducer,
    userProfile: userProfileReducer,
});

export type AuthState = ReturnType<typeof reducers>;

export const reducer = (state: AuthState, action: AuthAction) => {
    if (action.type === RESET_AUTH_STATE) {
        return reducers(undefined, action);
    }
    return reducers(state, action);
};
