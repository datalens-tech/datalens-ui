import type {QLValue} from './misc-helpers';

export function formatUnknownTypeValue(value: string | number | null) {
    if (value === null) {
        return null;
    }

    return JSON.stringify(value);
}

export function renderValue(value: QLValue) {
    if (value === null) {
        return 'null';
    }

    return value;
}

export function parseNumberValue(value: number | string | null) {
    let result;

    if (value === null) {
        result = null;
    } else if (value === '-inf') {
        result = -Infinity;
    } else if (value === 'inf') {
        result = Infinity;
    } else if (value === 'nan') {
        result = NaN;
    } else {
        result = Number(value);
    }

    return result;
}

export function parseNumberValueForTable(value: number | string | null) {
    let result;

    if (value === null) {
        result = null;
    } else if (value === '-inf') {
        result = '-Infinity';
    } else if (value === 'inf') {
        result = 'Infinity';
    } else if (value === 'nan') {
        result = 'NaN';
    } else {
        result = Number(value);
    }

    return result;
}
