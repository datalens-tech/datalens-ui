import type {ServerField, ServerFieldFormatting} from '../types';
import {DATASET_FIELD_TYPES} from '../types';

export const MINIMUM_FRACTION_DIGITS = 2;

type GetFormatOptionsArgs = {
    formatting?: ServerFieldFormatting;
    data_type: string;
};

export const getFormatOptions = (field: GetFormatOptionsArgs) => {
    const formatOptions = field.formatting || {};

    if (
        typeof formatOptions?.precision !== 'number' &&
        field.data_type === DATASET_FIELD_TYPES.FLOAT
    ) {
        formatOptions.precision = MINIMUM_FRACTION_DIGITS;
    }
    return formatOptions;
};

export function getFakeTitleOrTitle(field?: ServerField) {
    if (!field) {
        return '';
    }

    return field.fakeTitle || field.title;
}
