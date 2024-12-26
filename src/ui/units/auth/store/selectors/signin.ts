import type {DatalensGlobalState} from 'index';

export const selectLogin = (state: DatalensGlobalState) => state.auth.signin.login;
export const selectPassword = (state: DatalensGlobalState) => state.auth.signin.password;
