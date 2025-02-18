import type {DatalensGlobalState} from 'index';
import type {ThunkDispatch} from 'redux-thunk';
import type {Unionize} from 'utility-types';

import {RELOADED_URL_QUERY} from '../../../../../shared/components/auth/constants/url';
import logger from '../../../../libs/logger';
import type {SdkError} from '../../../../libs/schematic-sdk';
import {getSdk, isSdkError} from '../../../../libs/schematic-sdk';
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

export const submitSigninForm = ({onError}: {onError?: (error: SdkError) => void}) => {
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
                const url = new URL(rethPath || window.location.origin);
                url.searchParams.delete(RELOADED_URL_QUERY);
                window.location.href = url.toString();
            })
            .catch((error) => {
                if (!sdk.isCancel(error)) {
                    logger.logError('auth/signin failed', error);

                    dispatch(
                        showToast({
                            title: error.message,
                            error,
                        }),
                    );

                    if (isSdkError(error)) {
                        onError?.(error);
                    }
                }
            });
    };
};

type SigninDispatch = ThunkDispatch<DatalensGlobalState, void, SigninAction>;

export type SigninAction = UpdateFormValuesAction;
