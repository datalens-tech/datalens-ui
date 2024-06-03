import React from 'react';

import type {SelectOption} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import type {DatasetField, WithRequired} from 'shared';
import {
    AVAILABLE_FIELD_TYPES,
    DATASET_FIELD_TYPES,
    DatasetFieldAggregation,
    DatasetFieldType,
} from 'shared';
import {DataTypeIcon} from 'ui';

import type {ParameterFormState} from './useParameterForm';

const NEW_PARAMETER_FIELD = {
    calc_mode: 'parameter',
    source: '',
    description: '',
    title: '',
    type: DatasetFieldType.Dimension,
    aggregation: DatasetFieldAggregation.None,
    hidden: false,
};

const b = block('dialog-parameter');

export const getTypesList = (): SelectOption[] => {
    return AVAILABLE_FIELD_TYPES.map((type): WithRequired<SelectOption, 'text'> => {
        const text = i18n('dataset.dataset-editor.modify', `value_${type}`);
        return {
            qa: `dialog-parameter-${type}`,
            data: {
                icon: <DataTypeIcon className={b('icon')} dataType={type as DATASET_FIELD_TYPES} />,
            },
            value: type,
            content: text,
            text,
        };
    }).sort((current, next) => {
        const currentText = current.text;
        const nextText = next.text;

        return currentText.localeCompare(nextText, undefined, {numeric: true});
    });
};

export const createParameterField = (
    formState: ParameterFormState,
    item?: DatasetField,
): DatasetField => {
    return {
        ...(item ? item : NEW_PARAMETER_FIELD),
        guid: formState.name,
        title: formState.name,
        cast: formState.type,
        default_value: formState.defaultValue,
    } as DatasetField;
};

export const getDatepickerFormat = (type: DATASET_FIELD_TYPES): string | undefined => {
    switch (type) {
        case DATASET_FIELD_TYPES.DATE:
            return 'dd.MM.yyyy';
        case DATASET_FIELD_TYPES.GENERICDATETIME:
            return 'dd.MM.yyyy HH:mm:ss';
        default:
            return undefined;
    }
};
