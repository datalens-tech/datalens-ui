// import {I18n} from 'i18n';
import * as yup from 'yup';

// const i18n = I18n.keyset('auth.user-form-validation');

const i18n = (key: string, _?: Record<string, unknown>) => {
    const keys: Record<string, string> = {
        'label_error-first-name-max': 'First name must be less than 200 characters',
        'label_error-last-name-max': 'Last name must be less than 200 characters',
        'label_error-login-max': 'Login must be less than 200 characters',
        'label_error-login-min': 'Login must be at least 3 characters',
        'label_error-login-invalid':
            'The login must start with letters and end only with letters or numbers',
        'label_error-login-email-invalid': 'The email in the login is in the wrong format',
        'label_error-required-fields': 'Please fill in all required fields',
        'label_error-email-invalid': 'Incorrect email format',
        'label_error-password-max': 'Password must be less than 200 characters',
        'label_error-password-not-match': 'Passwords do not match',
        'label_error-password-invalid':
            'Create strong password<br></br>– min 12 characters<br></br>– make sure you mix uppercase letters, lowercase letters, special characters and numbers',
    };

    return keys[key] || '';
};

export const VALIDATING_REQUIRED_KEYS = {
    LOGIN: 'login',
    PASSWORD: 'password',
    REPEAT_PASSWORD: 'repeatPassword',
};

export const baseFieldsValidSchema = yup.object({
    firstName: yup.string().max(200, i18n('label_error-first-name-max', {max: 200})),
    lastName: yup.string().max(200, i18n('label_error-last-name-max', {max: 200})),
    login: yup
        .string()
        .min(3, i18n('label_error-login-min', {min: 3}))
        .max(200, i18n('label_error-login-max', {max: 200}))
        .when({
            is: (value: string) => value?.includes('@'),
            then: yup.string().email(i18n('label_error-login-email-invalid')),
            otherwise: yup.string().matches(/^[a-zA-Z][a-zA-Z\d_-]+[a-zA-Z\d]$/, {
                message: i18n('label_error-login-invalid'),
            }),
        }),
    email: yup.string().email(i18n('label_error-email-invalid')),
    repeatPassword: yup.string(),
    password: yup
        .string()
        .max(200, i18n('label_error-password-max', {max: 200}))
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*_-]).{8,}$/, {
            message: i18n('label_error-password-invalid', {min: 8}),
        }),
});

export const requiredBaseFieldsSchema = yup.object({
    // messages are used to identify fields names in setting validating state
    login: yup.string().required(VALIDATING_REQUIRED_KEYS.LOGIN),
    password: yup.string().required(VALIDATING_REQUIRED_KEYS.PASSWORD),
    repeatPassword: yup.string().required(VALIDATING_REQUIRED_KEYS.REPEAT_PASSWORD),
});
