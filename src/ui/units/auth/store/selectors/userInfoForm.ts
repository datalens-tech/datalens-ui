import type {DatalensGlobalState} from 'index';

export const selectLogin = (state: DatalensGlobalState) => state.auth.userInfoForm.values.login;
export const selectEmail = (state: DatalensGlobalState) => state.auth.userInfoForm.values.email;
export const selectFirstName = (state: DatalensGlobalState) =>
    state.auth.userInfoForm.values.firstName;
export const selectLastName = (state: DatalensGlobalState) =>
    state.auth.userInfoForm.values.lastName;
export const selectPassword = (state: DatalensGlobalState) =>
    state.auth.userInfoForm.values.password;
export const selectRepeatPassword = (state: DatalensGlobalState) =>
    state.auth.userInfoForm.values.repeatPassword;
export const selectRoles = (state: DatalensGlobalState) => state.auth.userInfoForm.values.roles;

export const selectLoginValidation = (state: DatalensGlobalState) =>
    state.auth.userInfoForm.validation.login;
export const selectEmailValidation = (state: DatalensGlobalState) =>
    state.auth.userInfoForm.validation.email;
export const selectFirstNameValidation = (state: DatalensGlobalState) =>
    state.auth.userInfoForm.validation.firstName;
export const selectLastNameValidation = (state: DatalensGlobalState) =>
    state.auth.userInfoForm.validation.lastName;
export const selectPasswordValidation = (state: DatalensGlobalState) =>
    state.auth.userInfoForm.validation.password;
export const selectRepeatPasswordValidation = (state: DatalensGlobalState) =>
    state.auth.userInfoForm.validation.repeatPassword;

export const selectUserInfoFormValues = (state: DatalensGlobalState) =>
    state.auth.userInfoForm.values;
