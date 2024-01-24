import {Feature} from 'shared/types/feature';
import Utils from 'ui/utils/utils';

import {ValidationErrorData} from './types';

export const isValidationError = ({required, value}: ValidationErrorData) => {
    const isRequired = Utils.isEnabledFeature(Feature.SelectorRequiredValue) && required;

    const isEmptyArray = Array.isArray(value) && !value.length;
    const isEmptyDateObject =
        !Array.isArray(value) && typeof value === 'object' && (!value.from || !value.to);

    if (!value || isEmptyArray || isEmptyDateObject) {
        return isRequired;
    }

    return false;
};

export const getRequiredLabel = ({title, required}: {title: string; required?: boolean}) => {
    return Utils.isEnabledFeature(Feature.SelectorRequiredValue) && required ? `${title}*` : title;
};

export const getRequiredInnerLabel = ({
    showTitle,
    innerTitle,
    required,
}: {
    showTitle: boolean;
    innerTitle?: string;
    required?: boolean;
}) => {
    // if only innerTitle is visible and label is not we add '*' to it
    return Utils.isEnabledFeature(Feature.SelectorRequiredValue) &&
        required &&
        !showTitle &&
        innerTitle
        ? `${innerTitle}*`
        : innerTitle;
};
