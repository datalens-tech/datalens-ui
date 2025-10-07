import isEmpty from 'lodash/isEmpty';

import type {DatasetField, Field, MarkupItem, ServerField, ServerFieldFormatting} from '../types';
import {DATASET_FIELD_TYPES, isFloatField, isNumberField} from '../types';
import {getFieldUISettings} from '../utils';

import {getDistinctValue} from './colors/distincts-helpers';
import {markupToRawString} from './wizard-helpers';

export const MINIMUM_FRACTION_DIGITS = 2;

type GetFormatOptionsArgs = {
    formatting?: ServerFieldFormatting;
    data_type: string;
    ui_settings?: string;
};

export const getFormatOptions = (field: GetFormatOptionsArgs) => {
    if (isNumberField(field)) {
        let formatOptions = field.formatting ?? {};

        if (isEmpty(formatOptions)) {
            const fieldUISettings = getFieldUISettings({field});
            formatOptions = fieldUISettings?.numberFormatting ?? {};
        }

        if (typeof formatOptions?.precision !== 'number' && isFloatField(field)) {
            formatOptions.precision = MINIMUM_FRACTION_DIGITS;
        }
        return formatOptions;
    }
    return undefined;
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
