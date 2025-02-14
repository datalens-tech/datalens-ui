import type {DatalensGlobalState} from 'ui/index';

export const selectServiceUsersListUsers = (state: DatalensGlobalState) =>
    state.serviceSettings.getUsersList.users;
export const selectServiceUsersListPageToken = (state: DatalensGlobalState) =>
    state.serviceSettings.getUsersList.nextPageToken;
export const selectServiceUsersisLoading = (state: DatalensGlobalState) =>
    state.serviceSettings.getUsersList.isLoading;
export const selectServiceUsersListError = (state: DatalensGlobalState) =>
    state.serviceSettings.getUsersList.error;
