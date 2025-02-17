import type {DatalensGlobalState} from 'index';

export const selectAuthPageInited = (state: DatalensGlobalState) =>
    state.auth.common.authPageInited;

export const selectRethPath = (state: DatalensGlobalState) => state.auth.common.rethPath;
