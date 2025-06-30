import * as yup from 'yup';

import type {FormValidationError} from '../../../helpers/validation';
import {VALIDATION_ERROR} from '../../../helpers/validation';
import type {FormOptions, FreeformSource} from '../../../store/types';
import type {EditedSource} from '../types';

import {BASE_TITLE_FORM_OPTIONS, TABLE_NAMES_INPUT, TITLE_INPUT, getPaths} from './helpers';

const concatTitleFormItem = (items: FormOptions[] = []) => {
    return [BASE_TITLE_FORM_OPTIONS as FormOptions].concat(items);
};

export const createValidationSchema = (items: FormOptions[] = []) => {
    const allItems = concatTitleFormItem(items);
    const schemaOptions = allItems.reduce<Record<string, yup.StringSchema<string | undefined>>>(
        (acc, {name, required}) => {
            acc[name] = yup.string();

            if (required) {
                acc[name] = acc[name].required();
            }

            if (name === TABLE_NAMES_INPUT) {
                acc[name] = acc[name].test(function (input?: string) {
                    if (!input) {
                        return true;
                    }

                    const paths = getPaths(input);
                    const hasDuplications = new Set(paths).size !== paths.length;

                    return hasDuplications
                        ? this.createError({path: this.path, type: VALIDATION_ERROR.HAS_DUPLICATES})
                        : true;
                });
            }

            return acc;
        },
        {},
    );

    return yup.object<Record<string, yup.StringSchema<string | undefined>>>(schemaOptions);
};

export const getDataForValidation = (source: EditedSource, freeformSource?: FreeformSource) => {
    const allItems = concatTitleFormItem(freeformSource?.form);

    return allItems.reduce<Record<string, string>>((acc, {name}) => {
        if (name === TITLE_INPUT) {
            acc[name] = source.title;
        } else {
            acc[name] = source.parameters[name];
        }

        return acc;
    }, {});
};

export const getValidationErrors = (
    schema: yup.ObjectSchema<Record<string, yup.StringSchema>>,
    data: Record<string, string>,
) => {
    let validationErrors: FormValidationError[] = [];

    try {
        schema.validateSync(data, {strict: true, abortEarly: false});
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            validationErrors = error.inner
                .map(({path: name, type}) => {
                    return name && type && {name, type};
                })
                // Without caste, ts does not understand that false values are cut off by the filter
                .filter(Boolean) as FormValidationError[];
        }
    }

    return validationErrors;
};
