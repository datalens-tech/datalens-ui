import qs from 'qs';
import type {FormApiSchemaItem, FormSchema, ValidatedItemAction} from 'shared/schema/types';

import {URL_QUERY} from '../../../../constants';
import type {FormDict} from '../../typings';
import {getFormWithTrimmedValues, getQueryParam} from '../../utils';

type FormDictValue = FormDict[keyof FormDict];

const getPreparedValue = (value: FormDictValue) => {
    return typeof value === 'number' ? String(value) : value;
};

export const getResultSchemaKeys = (args: {
    apiSchemaItem: FormApiSchemaItem;
    form?: FormDict;
    innerForm?: FormDict;
}) => {
    const {apiSchemaItem, form = {}, innerForm = {}} = args;

    return apiSchemaItem.items.reduce((acc, {name, defaultAction}) => {
        let action = defaultAction;
        let thenAction: ValidatedItemAction | undefined;
        const condition = apiSchemaItem.conditions?.find((iteratedCondition) => {
            const then = iteratedCondition.then.find((iteratedThen) => {
                return iteratedThen.selector.name === name;
            });

            thenAction = then?.action;

            return Boolean(thenAction);
        });

        if (condition) {
            const whenValue = form[condition.when.name] || innerForm[condition.when.name];

            if (thenAction && whenValue && whenValue === condition.equals) {
                action = thenAction;
            }
        }

        if (action === 'include') {
            acc.push(name);
        }

        return acc;
    }, [] as string[]);
};

// TODO: add unit test [CHARTS-5033]
export const getFormDefaults = (schema: FormSchema) => {
    const form: FormDict = {};
    const innerForm: FormDict = {};

    schema.rows.forEach((row) => {
        if ('items' in row) {
            row.items.forEach((item) => {
                const innerValue = Boolean('inner' in item && item.inner);

                if ('defaultValue' in item && item.defaultValue !== undefined) {
                    if (innerValue) {
                        innerForm[item.name] = item.defaultValue;
                    } else {
                        form[item.name] = item.defaultValue;
                    }
                }
            });
        } else if ('name' in row && 'defaultValue' in row && row.defaultValue !== undefined) {
            const innerValue = Boolean('inner' in row && row.inner);

            if (innerValue) {
                innerForm[row.name] = row.defaultValue as FormDictValue;
            } else {
                form[row.name] = row.defaultValue as FormDictValue;
            }
        }
    });

    return {form, innerForm};
};

/* * * The function parses the query parameter `_form'. It is desirable that it is assembled as follows: * `` * import qs from 'qs'; * const jsonParams = {p1: '1', p2: '2', p3: [1, 2]}; * const param = qs.stringify(jsonParams, {delimiter: ';'}); * `` * @returns {FormDict}*/
export const getQueryForm = (): FormDict => {
    const paramValue = getQueryParam(URL_QUERY.CONNECTION_FORM);

    if (!paramValue) {
        return {};
    }

    return qs.parse(paramValue, {delimiter: ';'}) as FormDict;
};

// TODO: add unit test [CHARTS-5033]
export const getFetchedFormData = (schema: FormSchema, fetchedData: FormDict) => {
    const form: FormDict = {};

    schema.rows.forEach((row) => {
        if ('items' in row) {
            row.items.forEach((item) => {
                if ('name' in item) {
                    form[item.name] = getPreparedValue(fetchedData[item.name]);
                }
            });
        }

        if ('name' in row && row.name) {
            form[row.name] = getPreparedValue(fetchedData[row.name]);
        }
    });

    return {form};
};

// TODO: add unit test [CHARTS-5033]
export const getDataForParamsChecking = (args: {
    form: FormDict;
    innerForm: FormDict;
    schema: FormSchema;
}): FormDict => {
    const {form, innerForm, schema} = args;
    const apiSchemaItem = schema.apiSchema?.check;
    const params = apiSchemaItem
        ? getResultSchemaKeys({apiSchemaItem, form, innerForm})
        : schema.apiSchema?.check?.items.map(({name}) => name) || [];

    return params.reduce((acc, param) => {
        acc[param] = form[param];
        return acc;
    }, {} as FormDict);
};

export const getResultFormData = (args: {
    form: FormDict;
    innerForm: FormDict;
    apiSchemaItem?: FormApiSchemaItem;
}): FormDict => {
    const {apiSchemaItem, form, innerForm} = args;

    if (!apiSchemaItem) {
        return getFormWithTrimmedValues(form);
    }

    const resultKeys = getResultSchemaKeys({apiSchemaItem, form, innerForm});

    return resultKeys.reduce((acc, key) => {
        const value = form[key];
        acc[key] = typeof value === 'string' ? value.trim() : value;
        return acc;
    }, {} as FormDict);
};
