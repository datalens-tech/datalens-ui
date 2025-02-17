import type {DatalensGlobalState} from 'index';
import type {ThunkDispatch} from 'redux-thunk';
import type {Unionize} from 'utility-types';

import {RELOADED_URL_QUERY} from '../../../../../shared/components/auth/constants/url';
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
                const url = new URL(rethPath || window.location.origin);
                url.searchParams.delete(RELOADED_URL_QUERY);
                window.location.href = url.toString();
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
