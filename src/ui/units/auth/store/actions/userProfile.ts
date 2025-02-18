import type {ThunkDispatch} from 'redux-thunk';
import type {GetUserProfileResponse} from 'shared/schema/auth/types/users';
import type {DatalensGlobalState} from 'ui/index';
import logger from 'ui/libs/logger';
import type {SdkError} from 'ui/libs/schematic-sdk';
import {getSdk, isSdkError} from 'ui/libs/schematic-sdk';
import {showToast} from 'ui/store/actions/toaster';

import {
    DELETE_USER_PROFILE_FAILED,
    DELETE_USER_PROFILE_LOADING,
    DELETE_USER_PROFILE_SUCCESS,
    GET_USER_PROFILE_FAILED,
    GET_USER_PROFILE_LOADING,
    GET_USER_PROFILE_SUCCESS,
    RESET_UPDATE_USER_PASSWORD_STATE,
    RESET_USER_PROFILE_STATE,
    UPDATE_USER_PASSWORD_FAILED,
    UPDATE_USER_PASSWORD_LOADING,
    UPDATE_USER_PASSWORD_SUCCESS,
} from '../constants/userProfile';

type ResetUserProfileStateAction = {
    type: typeof RESET_USER_PROFILE_STATE;
};

type GetUserProfileLoadingAction = {
    type: typeof GET_USER_PROFILE_LOADING;
};
type GetUserProfileSuccessAction = {
    type: typeof GET_USER_PROFILE_SUCCESS;
    data: GetUserProfileResponse;
};
type GetUserProfileFailedAction = {
    type: typeof GET_USER_PROFILE_FAILED;
    error: Error | null;
};

type DeleteUserProfileLoadingAction = {
    type: typeof DELETE_USER_PROFILE_LOADING;
};
type DeleteUserProfileSuccessAction = {
    type: typeof DELETE_USER_PROFILE_SUCCESS;
};
type DeleteUserProfileFailedAction = {
    type: typeof DELETE_USER_PROFILE_FAILED;
    error: Error | null;
};

type UpdateUserPasswordLoadingAction = {
    type: typeof UPDATE_USER_PASSWORD_LOADING;
};
type UpdateUserPasswordSuccessAction = {
    type: typeof UPDATE_USER_PASSWORD_SUCCESS;
};
type UpdateUserPasswordFailedAction = {
    type: typeof UPDATE_USER_PASSWORD_FAILED;
    error: Error | null;
};
type ResetUpdateUserPasswordStateAction = {
    type: typeof RESET_UPDATE_USER_PASSWORD_STATE;
};

export const resetUpdateUserPasswordState = (): ResetUpdateUserPasswordStateAction => ({
    type: RESET_UPDATE_USER_PASSWORD_STATE,
});

export const resetUserProfileState = (): ResetUserProfileStateAction => ({
    type: RESET_USER_PROFILE_STATE,
});

export type UserProfileAction =
    | GetUserProfileLoadingAction
    | GetUserProfileSuccessAction
    | GetUserProfileFailedAction
    | DeleteUserProfileLoadingAction
    | DeleteUserProfileSuccessAction
    | DeleteUserProfileFailedAction
    | ResetUserProfileStateAction
    | UpdateUserPasswordLoadingAction
    | UpdateUserPasswordSuccessAction
    | UpdateUserPasswordFailedAction
    | ResetUpdateUserPasswordStateAction;

export type UserProfileDispatch = ThunkDispatch<DatalensGlobalState, void, UserProfileAction>;

export function getUserProfile({userId}: {userId: string}) {
    return (dispatch: UserProfileDispatch) => {
        dispatch({type: GET_USER_PROFILE_LOADING});

        return getSdk()
            .sdk.auth.getUserProfile({userId})
            .then((data) => {
                dispatch({
                    type: GET_USER_PROFILE_SUCCESS,
                    data: data,
                });
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().sdk.isCancel(error);

                if (!isCanceled) {
                    logger.logError('auth/getUserProfile failed', error);

                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: GET_USER_PROFILE_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
}

export function deleteUserProfile({userId}: {userId: string}) {
    return (dispatch: UserProfileDispatch) => {
        dispatch({type: DELETE_USER_PROFILE_LOADING});

        return getSdk()
            .sdk.auth.deleteUser({userId})
            .then(() => {
                dispatch({
                    type: DELETE_USER_PROFILE_SUCCESS,
                });
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().sdk.isCancel(error);

                if (!isCanceled) {
                    logger.logError('auth/deleteUserProfile failed', error);

                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: DELETE_USER_PROFILE_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
}

export function updateUserPassword({
    data: {userId, newPassword, oldPassword},
    onSuccess,
    onError,
}: {
    data: {userId: string; newPassword: string; oldPassword?: string};
    onSuccess?: () => void;
    onError?: (error: SdkError) => void;
}) {
    return (dispatch: UserProfileDispatch) => {
        dispatch({type: UPDATE_USER_PASSWORD_LOADING});

        const updateAction = oldPassword
            ? getSdk().sdk.auth.updateMyUserPassword({newPassword, oldPassword})
            : getSdk().sdk.auth.updateUserPassword({userId, newPassword});

        return updateAction
            .then(() => {
                dispatch({
                    type: UPDATE_USER_PASSWORD_SUCCESS,
                });
                onSuccess?.();
            })
            .catch((error: Error) => {
                const isCanceled = getSdk().sdk.isCancel(error);

                if (!isCanceled) {
                    logger.logError('auth/updateUserPassword failed', error);

                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }

                dispatch({
                    type: UPDATE_USER_PASSWORD_FAILED,
                    error: isCanceled ? null : error,
                });

                if (isSdkError(error)) {
                    onError?.(error);
                }
            });
    };
}
