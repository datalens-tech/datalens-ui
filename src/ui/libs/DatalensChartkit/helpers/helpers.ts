// TODO: DEPRECATED, move to modules

import assignWith from 'lodash/assignWith';

import type {IndexSignatureObject} from '../types';

function randomString(length: number, chars: string) {
    let result = '';
    for (let i = length; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

export function getRandomCKId() {
    return `ck.${getRandomKey()}`;
}

export function getRandomKey() {
    return randomString(10, '0123456789abcdefghijklmnopqrstuvwxyz');
}

// wrap single values in an array
export function wrapToArray(value: unknown = '') {
    return Array.isArray(value) ? value : [value];
}

// get values from arrays in 1 element, otherwise execute distinct/uniq to remove empty values
export function unwrapFromArray(array: unknown) {
    if (Array.isArray(array)) {
        return array.length === 1 ? array[0] : [...new Set(array.filter(Boolean))];
    }
    return array;
}

// returns number if the number is in the boundary of the range limited by the lower and upper parameters
// if number > upper returns upper
// if number < lower returns lower
// clamp(3, 1, 8) --> 3
// clamp(11, 1, 8) --> 8
export function clamp(number: number, lower: number, upper: number) {
    let result = number;
    result = result <= upper ? result : upper;
    result = result >= lower ? result : lower;

    return result;
}

// @ts-ignore
export function deepAssign(...args) {
    // @ts-ignore
    return assignWith(...args, (objValue, srcValue) => {
        if (
            typeof objValue === 'object' &&
            !Array.isArray(objValue) &&
            typeof srcValue === 'object' &&
            !Array.isArray(srcValue)
        ) {
            // deepAssign({}, {params: {a: 1}}, {params: {}}) -> {params: {}}
            if (srcValue !== null && Object.keys(srcValue).length === 0) {
                return {};
            }
            return deepAssign({}, objValue, srcValue);
        }
        return undefined;
    });
}

// method for the case when the only key in the object needs to be output as a string
// for example, for stackTrace in Error or dataSourceInfo in Inspector
export function stringifyForCodeBlock(data: IndexSignatureObject) {
    const keys = Object.keys(data);
    return keys.length === 1 ? String(data[keys[0]]) : JSON.stringify(data, null, 2);
}
