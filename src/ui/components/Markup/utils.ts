import escapeRegExp from 'lodash/escapeRegExp';

const AVAILABLE_DIMENSIONS = ['px'];

function getNumericCSSValueRegExp(availableDimensions: string[]) {
    return new RegExp(`(\\d+)(${escapeRegExp(availableDimensions.join('|'))})?`);
}

export function isNumericCSSValueValid(
    value?: string | number,
    availableDimensions = AVAILABLE_DIMENSIONS,
) {
    if (typeof value === 'number') {
        return true;
    }

    if (typeof value !== 'string') {
        return false;
    }

    const regExp = getNumericCSSValueRegExp(availableDimensions);
    const match = value.match(regExp);

    if (!match) {
        return false;
    }

    const number = Number(match[1]);
    const dimension = match[2];

    if (Number.isNaN(number)) {
        return false;
    }

    if (!availableDimensions.includes(dimension)) {
        return false;
    }

    return true;
}
