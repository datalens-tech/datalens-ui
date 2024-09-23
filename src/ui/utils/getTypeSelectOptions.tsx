import React from 'react';

import type {SelectOption} from '@gravity-ui/uikit';
import type {DATASET_FIELD_TYPES, WithRequired} from 'shared';
import DataTypeIcon from 'ui/components/DataTypeIcon/DataTypeIcon';

import {getDatasetLabelValue} from './helpers';

export const getTypeSelectOptions = (types: DATASET_FIELD_TYPES[]): SelectOption[] => {
    return types
        .map((type): WithRequired<SelectOption, 'text'> => {
            const text = getDatasetLabelValue(type);
            return {
                data: {icon: <DataTypeIcon dataType={type} />},
                value: type,
                content: text,
                text,
            };
        })
        .sort((current, next) => {
            const currentText = current.text;
            const nextText = next.text;

            return currentText.localeCompare(nextText, undefined, {numeric: true});
        });
};
