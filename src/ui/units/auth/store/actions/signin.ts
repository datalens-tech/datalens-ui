import type {DatalensGlobalState} from 'index';
import type {ThunkDispatch} from 'redux-thunk';
import type {Unionize} from 'utility-types';

import logger from '../../../../libs/logger';
import {getSdk} from '../../../../libs/schematic-sdk';
import {showToast} from '../../../../store/actions/toaster';
import {UPDATE_FORM_VALUES} from '../constants/signin';

type UpdateFormValuesAction = {
    type: typeof UPDATE_FORM_VALUES;
    payload: Unionize<{password: string; login: string}>;
};
export const updateFormValues = (
    payload: UpdateFormValuesAction['payload'],
): UpdateFormValuesAction => ({
    type: UPDATE_FORM_VALUES,
    payload,
});

export const submitSigninForm = () => {
    return (dispatch: SigninDispatch, getState: () => DatalensGlobalState) => {
        const {sdk} = getSdk();
        const {login, password} = getState().auth.signin;

        return sdk.auth.auth
            .signin({
                login,
                password,
            })
            .then(() => {
                const {rethPath} = getState().auth.common;
                window.location.href = rethPath ? rethPath : '/';
            })
            .catch((error) => {
                if (!sdk.isCancel(error)) {
                    logger.logError('auth/signin failed', error);

                    dispatch(
                        showToast({
                            title: 'Failed to login',
                            error,
                        }),
                    );
                }
            });
    };
};

type SigninDispatch = ThunkDispatch<DatalensGlobalState, void, SigninAction>;

export type SigninAction = UpdateFormValuesAction;
