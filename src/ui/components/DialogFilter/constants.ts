import {
    ADDITIONAL_ARRAY_OPERATIONS,
    BASE_ARRAY_OPERATIONS,
    BASE_COMPARSION_OPERATIONS,
    BASE_DATE_OPERATIONS,
    BASE_EQUALITY_OPERATIONS,
    BASE_NULL_OPERATIONS,
    BASE_SET_OPERATIONS,
    BASE_STRING_OPERATIONS,
} from 'constants/operations';

import type {Operations} from 'shared';

export interface Operation {
    title: string;
    value: Operations;
    selectable?: boolean;
    range?: boolean;
}

export const LIST_ITEM_HEIGHT = 40;
export const NULL_TITLE = 'null';

export const DIMENSION_NUMBER_OPERATIONS: Operation[] = [
    ...BASE_SET_OPERATIONS.map((item) => ({...item, selectable: true})),
    ...BASE_EQUALITY_OPERATIONS,
    ...BASE_COMPARSION_OPERATIONS,
    ...BASE_NULL_OPERATIONS,
];

export const MEASURE_NUMBER_OPERATIONS: Operation[] = [
    ...BASE_EQUALITY_OPERATIONS,
    ...BASE_COMPARSION_OPERATIONS,
    ...BASE_NULL_OPERATIONS,
];

export const STRING_OPERATIONS: Operation[] = [
    ...BASE_SET_OPERATIONS.map((item) => ({...item, selectable: true})),
    ...BASE_EQUALITY_OPERATIONS,
    ...BASE_STRING_OPERATIONS,
    ...BASE_NULL_OPERATIONS,
    ...BASE_COMPARSION_OPERATIONS,
];

export const BOOLEAN_OPERATIONS: Operation[] = [
    ...BASE_EQUALITY_OPERATIONS,
    ...BASE_NULL_OPERATIONS,
];

export const DATE_OPERATIONS: Operation[] = [
    ...BASE_DATE_OPERATIONS.map((item) => ({...item, range: true})),
    ...BASE_EQUALITY_OPERATIONS.map((item) => ({...item, range: false})),
    ...BASE_COMPARSION_OPERATIONS.map((item) => ({...item, range: false})),
    ...BASE_NULL_OPERATIONS.map((item) => ({...item, range: false})),
    ...BASE_SET_OPERATIONS.map((item) => ({...item, selectable: true})),
];

export const ARRAY_OPERATIONS: Operation[] = [
    ...BASE_EQUALITY_OPERATIONS,
    ...ADDITIONAL_ARRAY_OPERATIONS,
    ...BASE_ARRAY_OPERATIONS,
    ...BASE_NULL_OPERATIONS,
];
