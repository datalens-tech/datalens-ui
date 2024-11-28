import {
    BASE_ARRAY_OPERATIONS,
    BASE_COMPARSION_OPERATIONS,
    BASE_DATE_OPERATIONS,
    BASE_EQUALITY_OPERATIONS,
    BASE_SET_OPERATIONS,
    BASE_STRING_OPERATIONS,
} from 'constants/operations';

export const ALL_OPERATIONS = [
    ...BASE_SET_OPERATIONS,
    ...BASE_EQUALITY_OPERATIONS,
    ...BASE_COMPARSION_OPERATIONS,
    ...BASE_STRING_OPERATIONS,
    ...BASE_DATE_OPERATIONS,
    ...BASE_ARRAY_OPERATIONS,
];

export const SELECTOR_OPERATIONS = [...BASE_EQUALITY_OPERATIONS];

export const MULTISELECT_OPERATIONS = [...BASE_SET_OPERATIONS];

export const INPUT_OPERATIONS_NUMBER_OR_DATE = [
    ...BASE_EQUALITY_OPERATIONS,
    ...BASE_COMPARSION_OPERATIONS,
];

export const INPUT_OPERATIONS_TEXT = [
    ...BASE_EQUALITY_OPERATIONS,
    ...BASE_COMPARSION_OPERATIONS,
    ...BASE_STRING_OPERATIONS,
];

export const DATEPICKER_OPERATIONS = [...BASE_EQUALITY_OPERATIONS, ...BASE_COMPARSION_OPERATIONS];

export const DATEPICKER_RANGE_OPERATIONS = [
    ...BASE_DATE_OPERATIONS.map((item) => ({...item, range: true})),
];

export const ELEMENT_TYPE: {
    SELECT: 'select';
    DATE: 'date';
    INPUT: 'input';
    CHECKBOX: 'checkbox';
} = {
    SELECT: 'select',
    DATE: 'date',
    INPUT: 'input',
    CHECKBOX: 'checkbox',
};

export const DATE_FORMAT = 'DD.MM.YYYY';

export const DATETIME_FORMAT = 'DD.MM.YYYY HH:mm:ss';

export enum CheckboxControlValue {
    TRUE = 'true',
    FALSE = 'false',
}
