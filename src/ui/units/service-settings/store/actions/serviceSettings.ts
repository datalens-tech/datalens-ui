import logger from 'libs/logger';
import type {ThunkDispatch} from 'redux-thunk';
import type {UserRole} from 'shared/components/auth/constants/role';
import type {GetUsersListResponse} from 'shared/schema/auth/types/users';
import type {DatalensGlobalState} from 'ui/index';
import {getSdk} from 'ui/libs/schematic-sdk';
import {showToast} from 'ui/store/actions/toaster';

import {
    RESET_DISPLAYED_USERS,
    SET_SERVICE_USERS_LIST_FAILED,
    SET_SERVICE_USERS_LIST_LOADING,
    SET_SERVICE_USERS_LIST_SUCCESS,
} from '../constants/serviceSettings';

export type ServiceSettingsActions =
    | SetServiceUsersListLoadingAction
    | SetServiceUsersListSuccessAction
    | SetServiceUsersListFailedAction
    | ResetDisplayedUsersListAction;

export type ServiceSettingsDispatch = ThunkDispatch<
    DatalensGlobalState,
    void,
    ServiceSettingsActions
>;

type SetServiceUsersListLoadingAction = {
    type: typeof SET_SERVICE_USERS_LIST_LOADING;
};
type SetServiceUsersListSuccessAction = {
    type: typeof SET_SERVICE_USERS_LIST_SUCCESS;
    payload: {data: GetUsersListResponse; isLoadMore?: boolean};
};
type SetServiceUsersListFailedAction = {
    type: typeof SET_SERVICE_USERS_LIST_FAILED;
    error: Error;
};
type ResetDisplayedUsersListAction = {
    type: typeof RESET_DISPLAYED_USERS;
};

export const resetDisplayedUsersList = () => {
    return (dispatch: ServiceSettingsDispatch) =>
        dispatch({
            type: RESET_DISPLAYED_USERS,
        });
};

export const getUsersList = ({
    nextPageToken,
    pageSize = 10,
    filterString,
    roles,
    isLoadMore,
}: {
    nextPageToken?: string;
    filterString?: string;
    roles?: `${UserRole}`[];
    isLoadMore?: boolean;
    pageSize?: number;
}) => {
    return async (dispatch: ServiceSettingsDispatch) => {
        try {
            dispatch({
                type: SET_SERVICE_USERS_LIST_LOADING,
            });
            const data = await getSdk().sdk.auth.getUsersList(
                {
                    page: Number(nextPageToken) || 0,
                    pageSize,
                    filterString,
                    roles,
                },
                {concurrentId: 'serviceSettings/getUsersList'},
            );
            dispatch({
                type: SET_SERVICE_USERS_LIST_SUCCESS,
                payload: {data, isLoadMore},
            });
        } catch (error) {
            if (getSdk().sdk.isCancel(error)) {
                return;
            }
            logger.logError('serviceSettings/getUsersList failed', error);
            dispatch(
                showToast({
                    title: error.message,
                    error,
                }),
            );
            dispatch({
                type: SET_SERVICE_USERS_LIST_FAILED,
                error,
            });
        }
    };
};
