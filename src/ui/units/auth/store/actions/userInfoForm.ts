import type {DatalensGlobalState} from 'index';
import type {ThunkDispatch} from 'redux-thunk';

import {RELOADED_URL_QUERY} from '../../../../../shared/components/auth/constants/url';
import logger from '../../../../libs/logger';
import {getSdk} from '../../../../libs/schematic-sdk';
import {showToast} from '../../../../store/actions/toaster';
import {RESET_FORM_VALUES, UPDATE_FORM_VALUES} from '../constants/userInfoForm';
import type {UserInfoFormFormValues} from '../typings/userInfoForm';

type UpdateFormValuesAction = {
    type: typeof UPDATE_FORM_VALUES;
    payload: Partial<UserInfoFormFormValues>;
};
export const updateFormValues = (
    payload: UpdateFormValuesAction['payload'],
): UpdateFormValuesAction => ({
    type: UPDATE_FORM_VALUES,
    payload,
});

type ResetFormValuesAction = {
    type: typeof RESET_FORM_VALUES;
};

export const resetUserInfoForm = (): ResetFormValuesAction => ({
    type: RESET_FORM_VALUES,
});

export const submitSignupForm = () => {
    return (dispatch: UserInfoFormDispatch, getState: () => DatalensGlobalState) => {
        const {sdk} = getSdk();
        const {login, password, lastName, firstName, email} = getState().auth.userInfoForm;

        // TODO: add validation
        return sdk.auth.auth
            .signup({
                login,
                password,
                lastName,
                firstName,
                email,
            })
            .then(() => {
                const {rethPath} = getState().auth.common;
                const url = new URL(rethPath || window.location.origin);
                url.searchParams.delete(RELOADED_URL_QUERY);
                window.location.href = url.toString();
            })
            .catch((error) => {
                if (!sdk.isCancel(error)) {
                    logger.logError('auth/userInfoForm failed', error);

                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );
                }
            });
    };
};

export type UserInfoFormDispatch = ThunkDispatch<DatalensGlobalState, void, UserInfoFormAction>;

export type UserInfoFormAction = UpdateFormValuesAction | ResetFormValuesAction;
