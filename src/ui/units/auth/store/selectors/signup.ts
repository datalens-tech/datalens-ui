import type {DatalensGlobalState} from 'index';

export const selectLogin = (state: DatalensGlobalState) => state.auth.signup.login;
export const selectEmail = (state: DatalensGlobalState) => state.auth.signup.email;
export const selectFirstName = (state: DatalensGlobalState) => state.auth.signup.firstName;
export const selectLastName = (state: DatalensGlobalState) => state.auth.signup.lastName;
export const selectPassword = (state: DatalensGlobalState) => state.auth.signup.password;
export const selectRepeatPassword = (state: DatalensGlobalState) =>
    state.auth.signup.repeatPassword;
