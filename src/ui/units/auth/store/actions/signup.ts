import type {DatalensGlobalState} from 'index';
import type {ThunkDispatch} from 'redux-thunk';
import type {Unionize} from 'utility-types';

import logger from '../../../../libs/logger';
import {getSdk} from '../../../../libs/schematic-sdk';
import {showToast} from '../../../../store/actions/toaster';
import {UPDATE_FORM_VALUES} from '../constants/signup';

type UpdateFormValuesAction = {
    type: typeof UPDATE_FORM_VALUES;
    payload: Unionize<{
        login: string;
        email: string;
        firstName: string;
        lastName: string;
        password: string;
        repeatPassword: string;
    }>;
};
export const updateFormValues = (
    payload: UpdateFormValuesAction['payload'],
): UpdateFormValuesAction => ({
    type: UPDATE_FORM_VALUES,
    payload,
});

export const submitSignupForm = () => {
    return (dispatch: SignupDispatch, getState: () => DatalensGlobalState) => {
        const {sdk} = getSdk();
        const {login, password, lastName, firstName, email} = getState().auth.signup;

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
                window.location.href = rethPath ? rethPath : '/';
            })
            .catch((error) => {
                if (!sdk.isCancel(error)) {
                    logger.logError('auth/signup failed', error);

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

type SignupDispatch = ThunkDispatch<DatalensGlobalState, void, SignupAction>;

export type SignupAction = UpdateFormValuesAction;
