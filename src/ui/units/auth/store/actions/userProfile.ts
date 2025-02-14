import type {ThunkDispatch} from 'redux-thunk';
import type {GetUserProfileResponse} from 'shared/schema/auth/types/users';
import type {DatalensGlobalState} from 'ui/index';
import logger from 'ui/libs/logger';
import {getSdk} from 'ui/libs/schematic-sdk';

import {
    GET_USER_PROFILE_FAILED,
    GET_USER_PROFILE_LOADING,
    GET_USER_PROFILE_SUCCESS,
    RESET_USER_PROFILE_STATE,
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

export const resetUserProfileState = (): ResetUserProfileStateAction => ({
    type: RESET_USER_PROFILE_STATE,
});

export type UserProfileAction =
    | GetUserProfileLoadingAction
    | GetUserProfileSuccessAction
    | GetUserProfileFailedAction
    | ResetUserProfileStateAction;

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
                }

                dispatch({
                    type: GET_USER_PROFILE_FAILED,
                    error: isCanceled ? null : error,
                });

                return null;
            });
    };
}
