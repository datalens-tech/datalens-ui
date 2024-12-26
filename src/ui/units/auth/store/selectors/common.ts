import type {DatalensGlobalState} from 'index';

export const selectAuthPageInited = (state: DatalensGlobalState) =>
    state.auth.common.authPageInited;
