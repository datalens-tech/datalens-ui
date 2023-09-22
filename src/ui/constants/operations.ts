import {I18n} from 'i18n';
import {Operations} from 'shared';

const i18n = I18n.keyset('component.operations');

export const NO_SELECTED_VALUES_OPERATION = {
    get title() {
        return i18n('label_operation-all-values');
    },
    value: Operations.NO_SELECTED_VALUES,
};

export const BASE_EQUALITY_OPERATIONS = [
    {
        get title() {
            return i18n('label_operation-equals');
        },
        value: Operations.EQ,
    },
    {
        get title() {
            return i18n('label_operation-nequals');
        },
        value: Operations.NE,
    },
];

export const BASE_COMPARSION_OPERATIONS = [
    {
        get title() {
            return i18n('label_operation-gt');
        },
        value: Operations.GT,
    },
    {
        get title() {
            return i18n('label_operation-lt');
        },
        value: Operations.LT,
    },
    {
        get title() {
            return i18n('label_operation-gte');
        },
        value: Operations.GTE,
    },
    {
        get title() {
            return i18n('label_operation-lte');
        },
        value: Operations.LTE,
    },
];

export const BASE_SET_OPERATIONS = [
    {
        get title() {
            return i18n('label_operation-in');
        },
        value: Operations.IN,
    },
    {
        get title() {
            return i18n('label_operation-nin');
        },
        value: Operations.NIN,
    },
];

export const BASE_STRING_OPERATIONS = [
    {
        get title() {
            return i18n('label_operation-startswith');
        },
        value: Operations.ISTARTSWITH,
    },
    {
        get title() {
            return i18n('label_operation-startswith-case');
        },
        value: Operations.STARTSWITH,
    },
    {
        get title() {
            return i18n('label_operation-endswith');
        },
        value: Operations.IENDSWITH,
    },
    {
        get title() {
            return i18n('label_operation-endswith-case');
        },
        value: Operations.ENDSWITH,
    },
    {
        get title() {
            return i18n('label_operation-contains');
        },
        value: Operations.ICONTAINS,
    },
    {
        get title() {
            return i18n('label_operation-contains-case');
        },
        value: Operations.CONTAINS,
    },
    {
        get title() {
            return i18n('label_operation-notcontains');
        },
        value: Operations.NOTICONTAINS,
    },
    {
        get title() {
            return i18n('label_operation-notcontains-case');
        },
        value: Operations.NOTCONTAINS,
    },
];

export const BASE_ARRAY_OPERATIONS = [
    {
        get title() {
            return i18n('label_operation-leneq');
        },
        value: Operations.LENEQ,
    },
    {
        get title() {
            return i18n('label_operation-lengt');
        },
        value: Operations.LENGT,
    },
    {
        get title() {
            return i18n('label_operation-lengte');
        },
        value: Operations.LENGTE,
    },
    {
        get title() {
            return i18n('label_operation-lenlt');
        },
        value: Operations.LENLT,
    },
    {
        get title() {
            return i18n('label_operation-lenlte');
        },
        value: Operations.LENLTE,
    },
];

export const ADDITIONAL_ARRAY_OPERATIONS = [
    {
        get title() {
            return i18n('label_operation-contains-case');
        },
        value: Operations.CONTAINS,
    },
    {
        get title() {
            return i18n('label_operation-notcontains-case');
        },
        value: Operations.NOTCONTAINS,
    },
    {
        get title() {
            return i18n('label_operation-startswith-case');
        },
        value: Operations.STARTSWITH,
    },
];

export const BASE_DATE_OPERATIONS = [
    {
        get title() {
            return i18n('label_operation-date-in');
        },
        value: Operations.BETWEEN,
    },
];

export const BASE_NULL_OPERATIONS = [
    {
        get title() {
            return i18n('label_operation-is-null');
        },
        value: Operations.ISNULL,
    },
    {
        get title() {
            return i18n('label_operation-is-not-null');
        },
        value: Operations.ISNOTNULL,
    },
];
