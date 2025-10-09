import {I18n} from 'i18n';

import {ValidationErrorType} from '../constants';
import type {ValidationError} from '../typings';

const i18n = I18n.keyset('connections.form');

export const getValidationError = (fieldKey: string, errors: ValidationError[] = []) => {
    return errors.find((err) => err.name === fieldKey);
};

export const getErrorMessage = (type?: ValidationErrorType) => {
    switch (type) {
        case ValidationErrorType.Optionality:
        case ValidationErrorType.Required: {
            return i18n('label_error-empty-field');
        }
        case ValidationErrorType.Length: {
            return i18n('label_error-length-field');
        }
        case ValidationErrorType.DuplicatedKey: {
            return i18n('label_error-duplicated-keys');
        }
        default: {
            return '';
        }
    }
};
