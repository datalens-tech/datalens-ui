import {I18n} from 'i18n';
import type {BaseSchema} from 'yup';
import {ValidationError} from 'yup';

const i18n = I18n.keyset('validation');

export function fieldValidateFactory<T>(schema: BaseSchema<T>, errorMessage?: string) {
    return (value: T) => {
        try {
            schema.validateSync(value, {abortEarly: true});
            return '';
        } catch (err) {
            if (errorMessage) {
                return errorMessage;
            }
            if (err instanceof ValidationError) {
                return err.message;
            }
            return i18n('label_unknown-error');
        }
    };
}

const matchSpecialParameterNamesRegex = /^(tab|state|mode|focus|grid|tz|from|to)$/;
const matchNonLatinLettersRegex = /[^a-zA-Z0-9-_]/;
const matchSpecialCharactersRegex = /[~`!@#$%^*"&()|\\={}[\]:;,.<>+?]/;

export const isStringWithHex = (str: string) => /^#[\da-f]{3,6}$/i.test(str);

export const isStringWithFullLengthHex = (str: string) => /^#[\da-f]{6}$/i.test(str);

export const validateParameterName = (value: string): boolean => {
    if (value.length > 36) {
        return false;
    }

    if (value.startsWith('_')) {
        return false;
    }

    if (matchNonLatinLettersRegex.test(value)) {
        return false;
    }

    if (matchSpecialParameterNamesRegex.test(value)) {
        return false;
    }

    if (matchSpecialCharactersRegex.test(value)) {
        return false;
    }

    return true;
};
