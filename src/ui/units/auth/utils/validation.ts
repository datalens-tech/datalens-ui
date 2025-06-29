import {I18n} from 'i18n';
import * as yup from 'yup';

const i18n = I18n.keyset('auth.user-form-validation');

export const VALIDATING_REQUIRED_KEYS = {
    LOGIN: 'login',
    PASSWORD: 'password',
    REPEAT_PASSWORD: 'repeatPassword',
};

export const passwordValidationSchema = yup
    .string()
    .max(200, i18n('label_error-password-max', {max: 200}))
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*_-]).{8,}$/, {
        message: i18n('label_error-password-invalid', {min: 8}),
    });

export const baseFieldsValidSchema = yup.object({
    firstName: yup.string().max(200, i18n('label_error-first-name-max', {max: 200})),
    lastName: yup.string().max(200, i18n('label_error-last-name-max', {max: 200})),
    login: yup
        .string()
        .min(3, i18n('label_error-login-min', {min: 3}))
        .max(200, i18n('label_error-login-max', {max: 200}))
        .when([], {
            is: (value: string) => value?.includes('@'),
            then: (schema) => schema.email(i18n('label_error-login-email-invalid')),
            otherwise: (schema) =>
                schema.matches(/^[a-zA-Z][a-zA-Z\d_-]+[a-zA-Z\d]$/, {
                    message: i18n('label_error-login-invalid'),
                }),
        }),
    email: yup.string().email(i18n('label_error-email-invalid')),
    repeatPassword: yup.string(),
    password: passwordValidationSchema,
});

export const requiredBaseFieldsSchema = yup.object({
    // messages are used to identify fields names in setting validating state
    login: yup.string().required(VALIDATING_REQUIRED_KEYS.LOGIN),
    password: yup.string().required(VALIDATING_REQUIRED_KEYS.PASSWORD),
});

export const fullRequiredFieldsSchema = requiredBaseFieldsSchema.concat(
    yup.object({
        repeatPassword: yup.string().required(VALIDATING_REQUIRED_KEYS.REPEAT_PASSWORD),
    }),
);
