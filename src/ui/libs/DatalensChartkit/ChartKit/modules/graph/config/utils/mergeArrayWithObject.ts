import merge from 'lodash/merge';

export function mergeArrayWithObject(a: unknown[] | unknown, b: unknown[] | unknown) {
    // for example, for xAxis/yAxis, when there is one axis on one side and several on the other
    // typeof === 'object' check the case when string was received
    if (Array.isArray(a) && b && typeof b === 'object' && !Array.isArray(b)) {
        return a.map((value) => merge(value, b));
    }

    if (Array.isArray(b) && a && typeof a === 'object' && !Array.isArray(a)) {
        return b.map((value) => merge({}, a, value));
    }

    return undefined;
}
