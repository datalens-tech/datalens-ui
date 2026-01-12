import type {DatalensGlobalState} from 'ui/index';

export const selectServiceUsersListUsers = (state: DatalensGlobalState) =>
    state.serviceSettings.getUsersList.users;
export const selectServiceUsersListPageToken = (state: DatalensGlobalState) =>
    state.serviceSettings.getUsersList.nextPageToken;
export const selectServiceUsersListIsInitialLoading = (state: DatalensGlobalState) =>
    state.serviceSettings.getUsersList.isInitialLoading;
export const selectServiceUsersListIsLoadingMore = (state: DatalensGlobalState) =>
    state.serviceSettings.getUsersList.isLoadingMore;
export const selectServiceUsersListError = (state: DatalensGlobalState) =>
    state.serviceSettings.getUsersList.error;

export const selectCreateUserData = (state: DatalensGlobalState) =>
    state.serviceSettings.createUser.data;
export const selectCreateUserIsLoading = (state: DatalensGlobalState) =>
    state.serviceSettings.createUser.isLoading;
export const selectCreateUserError = (state: DatalensGlobalState) =>
    state.serviceSettings.createUser.error;
