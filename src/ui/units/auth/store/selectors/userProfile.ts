import type {DatalensGlobalState} from 'index';

export const selectUserProfile = (state: DatalensGlobalState) =>
    state.auth.userProfile.getProfile.data?.profile;

export const selectUserProfileIsLoading = (state: DatalensGlobalState) =>
    state.auth.userProfile.getProfile.isLoading;

export const selectUserProfileError = (state: DatalensGlobalState) =>
    state.auth.userProfile.getProfile.error;

export const selectDeleteUserProfileIsLoading = (state: DatalensGlobalState) =>
    state.auth.userProfile.deleteProfile.isLoading;

export const selectUpdateUserPasswordIsLoading = (state: DatalensGlobalState) =>
    state.auth.userProfile.updatePassword.isLoading;

export const selectUpdateUserRoleIsLoading = (state: DatalensGlobalState) =>
    state.auth.userProfile.updateRole.isLoading;

export const selectEditUserProfileIsLoading = (state: DatalensGlobalState) =>
    state.auth.userProfile.editProfile.isLoading;
