import type {DatasetField, Field, MarkupItem, ServerField, ServerFieldFormatting} from '../types';
import {DATASET_FIELD_TYPES} from '../types';

import {getDistinctValue} from './colors/distincts-helpers';
import {markupToRawString} from './wizard-helpers';

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

export function getFieldDistinctValues(field: Field | DatasetField, distinctsData: string[][]) {
    return distinctsData.reduce((acc: string[], cur: (string | MarkupItem)[]) => {
        const rawDistinctValue = cur[0];
        let distinctValue: string;

        if (field.data_type === DATASET_FIELD_TYPES.MARKUP && rawDistinctValue) {
            distinctValue = markupToRawString(rawDistinctValue as MarkupItem);
        } else {
            distinctValue = getDistinctValue(rawDistinctValue);
        }

        return acc.concat(distinctValue);
    }, [] as string[]);
}
