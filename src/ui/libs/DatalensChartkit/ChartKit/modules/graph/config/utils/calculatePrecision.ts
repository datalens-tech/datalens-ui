import isInteger from 'lodash/isInteger';

export const calculatePrecision = (
    alternativePrecision: number | null,
    options: {normalizeDiv: boolean; normalizeSub: boolean; precision?: number},
    originalValue?: number,
) => {
    const hasPrecisionOption = options.precision || options.precision === 0;
    const hasAlternativePrecision = alternativePrecision || alternativePrecision === 0;
    const hasFloat = originalValue && !isInteger(originalValue);

    let precision;

    if (options.normalizeDiv || options.normalizeSub) {
        precision = 2;
    }

    if (hasPrecisionOption) {
        precision = options.precision;
    }

    if (!precision && precision !== 0 && hasAlternativePrecision) {
        precision = alternativePrecision;
    }

    if (hasFloat && !precision && precision !== 0 && !hasAlternativePrecision) {
        precision = 2;
    }

    return precision;
};
