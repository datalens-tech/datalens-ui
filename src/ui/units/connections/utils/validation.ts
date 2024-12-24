import {I18n} from 'i18n';

import {ValidationErrorType, i18n10647} from '../constants';
import type {ValidationError} from '../typings';

const i18n = I18n.keyset('connections.form');

export const getValidationError = (fieldKey: string, errors: ValidationError[] = []) => {
    return errors.find((err) => err.name === fieldKey);
};

export const getErrorMessage = (type?: ValidationErrorType) => {
    switch (type) {
        case ValidationErrorType.Required: {
            return i18n('label_error-empty-field');
        }
        case ValidationErrorType.Length: {
            return i18n('label_error-length-field');
        }
        case ValidationErrorType.DuplicatedKey: {
            return i18n10647['label_duplicated-keys'];
        }
        default: {
            return '';
        }
    }
};
