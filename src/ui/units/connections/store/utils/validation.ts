import type {PartialBy} from 'shared';
import type {FormApiSchemaItem, ValidatedItem} from 'shared/schema/types';
import * as yup from 'yup';

import logger from '../../../../libs/logger';
import {ValidationErrorType} from '../../constants';
import type {FormDict, ValidationError} from '../../typings';
import {isDebugMode} from '../../utils';

import {getResultFormData, getResultSchemaKeys} from './forms';

type SchemaOptions = Record<
    string,
    | yup.StringSchema<string | null | undefined, Record<string, any>, string | null | undefined>
    | yup.BooleanSchema<boolean | null | undefined, Record<string, any>, boolean | null | undefined>
    | yup.ObjectSchema<Record<string, any> | null>
>;

type ValidationArgs = {
    apiSchemaItem: FormApiSchemaItem;
    form: FormDict;
    innerForm: FormDict;
};

const getResultValidatedItems = (args: PartialBy<ValidationArgs, 'innerForm'>) => {
    const {apiSchemaItem, form, innerForm} = args;
    const resultKeys = getResultSchemaKeys({apiSchemaItem, form, innerForm});

    return resultKeys.reduce<ValidatedItem[]>((acc, key) => {
        const item = apiSchemaItem.items.find(({name}) => name === key);

        if (item) {
            acc.push(item);
        }

        return acc;
    }, []);
};

const createValidationSchema = (args: PartialBy<ValidationArgs, 'innerForm'>) => {
    const {apiSchemaItem, form, innerForm} = args;
    const vaildationItems = getResultValidatedItems({apiSchemaItem, form, innerForm});
    const schemaOptions = vaildationItems.reduce<SchemaOptions>((acc, item) => {
        const {name, type = 'string', required, nullable, length} = item;

        switch (type) {
            case 'boolean': {
                acc[name] = yup.boolean();
                break;
            }
            case 'string': {
                acc[name] = yup.string();
                break;
            }
            case 'object': {
                acc[name] = yup.object();
            }
        }

        if (type === 'string' && typeof length === 'number') {
            acc[name] = (acc[name] as yup.StringSchema).test(function (input?: string) {
                if (!input) {
                    return true;
                }

                return input.length === length
                    ? true
                    : this.createError({path: this.path, type: ValidationErrorType.Length});
            });
        }

        if (required) {
            acc[name] = acc[name].required();
        }

        if (nullable) {
            acc[name] = acc[name].nullable();
        }

        return acc;
    }, {});

    return yup.object<SchemaOptions>(schemaOptions);
};

const createValidationData = (args: PartialBy<ValidationArgs, 'innerForm'>): FormDict => {
    const {apiSchemaItem, form, innerForm} = args;
    const vaildationItems = getResultValidatedItems({apiSchemaItem, form, innerForm});

    return vaildationItems.reduce<FormDict>((acc, {name}) => {
        acc[name] = form[name];
        return acc;
    }, {});
};

const validateSchema = (schema: yup.ObjectSchema<SchemaOptions>, data: FormDict) => {
    let validationErrors: ValidationError[] = [];

    try {
        schema.validateSync(data, {strict: true, abortEarly: false});
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            validationErrors = error.inner
                .map(({path: name, type}) => {
                    return name && type && {name, type};
                })
                .filter(Boolean) as ValidationError[];
        }
    }

    return validationErrors;
};

// TODO: add unit test [CHARTS-5033]
export const getValidationErrors = (args: PartialBy<ValidationArgs, 'innerForm'>) => {
    const {apiSchemaItem, form, innerForm} = args;
    const validationSchema = createValidationSchema({apiSchemaItem, form, innerForm});
    const validationData = createValidationData({apiSchemaItem, form, innerForm});
    const validationErrors = validateSchema(validationSchema, validationData);

    if (isDebugMode() && validationErrors.length) {
        logger.log('Validation errors:', {validationErrors});
    }

    return validationErrors;
};

// TODO: add unit test [CHARTS-5033]
export const validateFormBeforeAction = (args: PartialBy<ValidationArgs, 'apiSchemaItem'>) => {
    const {form, innerForm, apiSchemaItem} = args;

    if (!apiSchemaItem) {
        return [];
    }

    const resultForm = getResultFormData({apiSchemaItem, form, innerForm});

    return getValidationErrors({apiSchemaItem, form: resultForm, innerForm});
};
