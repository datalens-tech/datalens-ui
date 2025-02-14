import type {DatalensGlobalState} from 'index';

export const selectUserProfile = (state: DatalensGlobalState) =>
    state.auth.userProfile.getProfile.data?.profile;

export const selectUserProfileIsLoading = (state: DatalensGlobalState) =>
    state.auth.userProfile.getProfile.isLoading;

export const selectUserProfileError = (state: DatalensGlobalState) =>
    state.auth.userProfile.getProfile.error;
