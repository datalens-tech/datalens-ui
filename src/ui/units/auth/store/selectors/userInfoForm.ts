import type {DatalensGlobalState} from 'index';

export const selectLogin = (state: DatalensGlobalState) => state.auth.userInfoForm.login;
export const selectEmail = (state: DatalensGlobalState) => state.auth.userInfoForm.email;
export const selectFirstName = (state: DatalensGlobalState) => state.auth.userInfoForm.firstName;
export const selectLastName = (state: DatalensGlobalState) => state.auth.userInfoForm.lastName;
export const selectPassword = (state: DatalensGlobalState) => state.auth.userInfoForm.password;
export const selectRepeatPassword = (state: DatalensGlobalState) =>
    state.auth.userInfoForm.repeatPassword;
export const selectRoles = (state: DatalensGlobalState) => state.auth.userInfoForm.roles;

export const selectUserInfoForm = (state: DatalensGlobalState) => state.auth.userInfoForm;
