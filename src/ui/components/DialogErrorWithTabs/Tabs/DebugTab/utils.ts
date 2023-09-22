import isEmpty from 'lodash/isEmpty';

export const hasAtLeastOneFilledValue = (target?: any): boolean => {
    return target && typeof target === 'object'
        ? Object.keys(target).some((key) => hasAtLeastOneFilledValue(target[key]))
        : !isEmpty(target);
};
