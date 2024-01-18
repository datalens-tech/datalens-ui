import {Feature} from 'shared/types/feature';
import Utils from 'ui/utils/utils';

import {ValidationErrorData} from './types';

export const isValidationError = ({isValueRequired, value}: ValidationErrorData) => {
    const isRequired = Utils.isEnabledFeature(Feature.SelectorRequiredValue) && isValueRequired;

    const isEmptyArray = Array.isArray(value) && !value.length;
    const isEmptyDateObject =
        !Array.isArray(value) && typeof value === 'object' && (!value.from || !value.to);

    if (!value || isEmptyArray || isEmptyDateObject) {
        return isRequired;
    }

    return false;
};
