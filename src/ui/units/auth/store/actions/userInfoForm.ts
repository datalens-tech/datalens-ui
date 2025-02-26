import {I18n} from 'i18n';
import type {DatalensGlobalState} from 'index';
import type {ThunkDispatch} from 'redux-thunk';

import {RELOADED_URL_QUERY} from '../../../../../shared/components/auth/constants/url';
import logger from '../../../../libs/logger';
import {getSdk} from '../../../../libs/schematic-sdk';
import {showToast} from '../../../../store/actions/toaster';
import {baseFieldsValidSchema, requiredBaseFieldsSchema} from '../../utils/validation';
import {
    RESET_FORM,
    RESET_FORM_VALIDATION,
    UPDATE_FORM_VALIDATION,
    UPDATE_FORM_VALUES,
} from '../constants/userInfoForm';
import type {UserInfoFormFormValues, ValidationFormState} from '../typings/userInfoForm';

const validationI18n = I18n.keyset('auth.user-form-validation');

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

type UpdateFormValidationAction = {
    type: typeof UPDATE_FORM_VALIDATION;
    payload: Partial<ValidationFormState>;
};
export const updateFormValidation = (
    payload: UpdateFormValidationAction['payload'],
): UpdateFormValidationAction => ({
    type: UPDATE_FORM_VALIDATION,
    payload,
});

type ResetFormValidationAction = {
    type: typeof RESET_FORM_VALIDATION;
};

export const resetUserInfoFormValidation = (): ResetFormValidationAction => ({
    type: RESET_FORM_VALIDATION,
});

type ResetFormAction = {
    type: typeof RESET_FORM;
};

export const resetUserInfoForm = (): ResetFormAction => ({
    type: RESET_FORM,
});

export const submitSignupForm = () => {
    return (dispatch: UserInfoFormDispatch, getState: () => DatalensGlobalState) => {
        const {sdk} = getSdk();
        const {login, password, lastName, firstName, email} = getState().auth.userInfoForm.values;

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

export const validateFormValues = ({
    onError,
    onSuccess,
}: {
    onError: (errorMessage: string) => void;
    onSuccess: () => void;
}) => {
    return (dispatch: UserInfoFormDispatch, getState: () => DatalensGlobalState) => {
        const userInfo = getState().auth.userInfoForm.values;

        try {
            requiredBaseFieldsSchema.validateSync(userInfo, {abortEarly: false});
        } catch (error) {
            if ('errors' in error) {
                const validationState = error.errors.reduce(
                    (acc: Record<string, 'invalid'>, fieldName: string) => {
                        acc[fieldName] = 'invalid';
                        return acc;
                    },
                    {},
                );
                onError(validationI18n('label_error-required-fields'));
                dispatch(updateFormValidation(validationState));
                return;
            }
        }

        try {
            baseFieldsValidSchema.validateSync(userInfo);
        } catch (error) {
            onError(error.message);
            dispatch(updateFormValidation({[error.path]: 'invalid'}));
            return;
        }

        if (userInfo.password !== userInfo.repeatPassword) {
            onError(validationI18n('label_error-password-not-match'));
            dispatch(updateFormValidation({password: 'invalid', repeatPassword: 'invalid'}));
            return;
        }

        onSuccess();
    };
};

export type UserInfoFormDispatch = ThunkDispatch<DatalensGlobalState, void, UserInfoFormAction>;

export type UserInfoFormAction =
    | UpdateFormValuesAction
    | ResetFormAction
    | UpdateFormValidationAction
    | ResetFormValidationAction;
