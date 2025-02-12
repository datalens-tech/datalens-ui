import type {DatalensGlobalState} from 'index';

export const selectUserProfile = (state: DatalensGlobalState) =>
    state.auth.userProfile.profile.data?.profile;

export const selectUserProfileIsLoading = (state: DatalensGlobalState) =>
    state.auth.userProfile.profile.isLoading;

export const selectUserProfileError = (state: DatalensGlobalState) =>
    state.auth.userProfile.profile.error;
