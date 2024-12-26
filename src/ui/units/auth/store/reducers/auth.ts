import type {AuthAction} from '../actions';
import {SET_AUTH_PAGE_INITED} from '../constants';
import type {AuthState} from '../types';

const initialState: AuthState = {
    authPageInited: false,
    rethPath: null,
};

export const authReducer = (state: AuthState = initialState, action: AuthAction) => {
    switch (action.type) {
        case SET_AUTH_PAGE_INITED: {
            return {
                ...state,
                ...action.payload,
            };
        }
        default: {
            return state;
        }
    }
};
