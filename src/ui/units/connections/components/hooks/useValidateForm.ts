import React from 'react';

import {batch, useDispatch} from 'react-redux';
import type {FormApiSchemaItem, Row} from 'shared/schema/types';

import {changeInnerForm, setValidationErrors} from '../../store';
import {validateFormBeforeAction} from '../../store/utils';
import type {FormDict} from '../../typings';
import {getCollapsesToExpand} from '../ConnectorForm/utils';

type ValidateFormArgs = {
    form: FormDict;
    innerForm: FormDict;
    apiSchemaItem?: FormApiSchemaItem;
    rows?: Row[];
};

export const useValidateForm = () => {
    const dispatch = useDispatch();

    const validateForm = React.useCallback(
        (args: ValidateFormArgs): boolean => {
            const {form, innerForm, apiSchemaItem, rows} = args;
            const errors = validateFormBeforeAction({form, innerForm, apiSchemaItem});

            if (!errors.length) {
                return true;
            }

            const errorNames = errors.map((e) => e.name);
            const collapsesToExpand = rows ? getCollapsesToExpand(rows, errorNames) : {};

            batch(() => {
                dispatch(setValidationErrors({errors}));
                if (Object.keys(collapsesToExpand).length) {
                    dispatch(changeInnerForm(collapsesToExpand));
                }
            });

            return false;
        },
        [dispatch],
    );

    return {validateForm};
};
