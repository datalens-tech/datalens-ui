import type {Primitive} from 'utility-types';

import {MAX_ARRAY_LENGTH} from './constants';

type CropObject = Primitive | object;

type Result = {
    result: CropObject;
    cropped: boolean;
};

export function cropArrays(original: CropObject): Result {
    let cropped = false;

    function crop(value: CropObject): CropObject {
        if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
                if (value.length > MAX_ARRAY_LENGTH) {
                    cropped = true;
                }
                return value.slice(0, MAX_ARRAY_LENGTH).map(crop);
            }
            const obj = value as Record<string, CropObject>;
            return Object.keys(obj).reduce(
                (o, key) => {
                    const v = obj[key];
                    o[key] = crop(v);
                    return o;
                },
                {} as Record<string, CropObject>,
            );
        }
        return value;
    }

    const result = crop(original);
    return {result, cropped};
}
