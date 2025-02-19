import logger from 'libs/logger';
import type {ThunkDispatch} from 'redux-thunk';
import type {UserRole} from 'shared/components/auth/constants/role';
import type {
    CreateUserArgs,
    CreateUserResponse,
    GetUsersListResponse,
} from 'shared/schema/auth/types/users';
import type {DatalensGlobalState} from 'ui/index';
import {getSdk} from 'ui/libs/schematic-sdk';
import {showToast} from 'ui/store/actions/toaster';

import {
    RESET_CREATE_USER,
    RESET_SERVICE_USERS_LIST,
    SET_CREATE_USER_FAILED,
    SET_CREATE_USER_LOADING,
    SET_CREATE_USER_SUCCESS,
    SET_SERVICE_USERS_LIST_FAILED,
    SET_SERVICE_USERS_LIST_LOADING,
    SET_SERVICE_USERS_LIST_SUCCESS,
} from '../constants/serviceSettings';

export type ServiceSettingsActions =
    | SetServiceUsersListLoadingAction
    | SetServiceUsersListSuccessAction
    | SetServiceUsersListFailedAction
    | ResetServiceUsersListAction
    | SetCreateUserLoadingAction
    | SetCreateUserSuccessAction
    | SetCreateUserFailedAction
    | ResetCreateUserAction;

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
type ResetServiceUsersListAction = {
    type: typeof RESET_SERVICE_USERS_LIST;
};

export const resetServiceUsersList = (): ResetServiceUsersListAction => ({
    type: RESET_SERVICE_USERS_LIST,
});

export const getUsersList = ({
    nextPageToken,
    pageSize = 10,
    filterString,
    roles,
    isLoadMore,
}: {
    nextPageToken?: string | null;
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

type SetCreateUserLoadingAction = {
    type: typeof SET_CREATE_USER_LOADING;
};
type SetCreateUserSuccessAction = {
    type: typeof SET_CREATE_USER_SUCCESS;
    payload: CreateUserResponse;
};
type SetCreateUserFailedAction = {
    type: typeof SET_CREATE_USER_FAILED;
    error: Error;
};
type ResetCreateUserAction = {
    type: typeof RESET_CREATE_USER;
};

export const resetCreateUser = (): ResetCreateUserAction => ({
    type: RESET_CREATE_USER,
});

export const createUser = ({
    onSuccess,
    userData,
}: {
    userData: CreateUserArgs;
    onSuccess?: () => void;
}) => {
    return async (dispatch: ServiceSettingsDispatch) => {
        try {
            dispatch({
                type: SET_CREATE_USER_LOADING,
            });
            // clean empty fields
            const preparedData: CreateUserArgs = {...userData};
            Object.entries(preparedData).forEach(([key, value]) => {
                if (!value) {
                    delete preparedData[key as keyof CreateUserArgs];
                }
            });
            const data = await getSdk().sdk.auth.createUser(preparedData, {
                concurrentId: 'serviceSettings/createUser',
            });
            onSuccess?.();
            dispatch({
                type: SET_CREATE_USER_SUCCESS,
                payload: data,
            });
        } catch (error) {
            const isCanceled = getSdk().sdk.isCancel(error);

            if (!isCanceled) {
                logger.logError('serviceSettings/createUser failed', error);
                dispatch(
                    showToast({
                        title: error.message,
                        error,
                    }),
                );
            }

            dispatch({
                type: SET_CREATE_USER_FAILED,
                error: isCanceled ? null : error,
            });
        }
    };
};
