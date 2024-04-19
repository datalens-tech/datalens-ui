import isNil from 'lodash/isNil';

const isStringValueInPercent = (value = '') => {
    return value.endsWith('%') && !Number.isNaN(Number.parseFloat(value));
};

const isStringValueInPixel = (value = '') => {
    return value.endsWith('px') && !Number.isNaN(Number.parseFloat(value));
};

// TODO: import from chartKit when it becomes possible
export const calculateNumericProperty = (args: {value?: string | number | null; base?: number}) => {
    const {value = '', base} = args;

    if (isNil(value)) {
        return undefined;
    }

    if (typeof value === 'string') {
        if (isStringValueInPercent(value) && typeof base === 'number') {
            const fraction = Number.parseFloat(value) / 100;
            return base * fraction;
        }

        if (isStringValueInPixel(value)) {
            return Number.parseFloat(value);
        }

        return undefined;
    }

    return value;
};
