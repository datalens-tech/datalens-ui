import type {DatalensGlobalState} from 'ui/index';

export const selectServiceUsersListData = (state: DatalensGlobalState) =>
    state.serviceSettings.getUsersList.data;
export const selectServiceUsersisLoading = (state: DatalensGlobalState) =>
    state.serviceSettings.getUsersList.isLoading;
export const selectServiceUsersListError = (state: DatalensGlobalState) =>
    state.serviceSettings.getUsersList.error;
export const selectDisplayedUsers = (state: DatalensGlobalState) =>
    state.serviceSettings.displayedUsers;
