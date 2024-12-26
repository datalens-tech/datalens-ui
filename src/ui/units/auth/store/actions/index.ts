import type {DatalensGlobalState} from 'index';
import type {ThunkDispatch} from 'redux-thunk';

import {RESET_AUTH_STATE, SET_AUTH_PAGE_INITED} from '../constants';

type ResetAuthStateAction = {
    type: typeof RESET_AUTH_STATE;
};

export const resetAuthState = (): ResetAuthStateAction => ({
    type: RESET_AUTH_STATE,
});

type SetAuthPageInitedAction = {
    type: typeof SET_AUTH_PAGE_INITED;
    payload: {authPageInited: boolean; rethPath: null | string};
};

export const setAuthPageInited = (
    payload: SetAuthPageInitedAction['payload'],
): SetAuthPageInitedAction => ({
    type: SET_AUTH_PAGE_INITED,
    payload,
});

export type AuthAction = SetAuthPageInitedAction | ResetAuthStateAction;

export type WorkbooksDispatch = ThunkDispatch<DatalensGlobalState, void, AuthAction>;
