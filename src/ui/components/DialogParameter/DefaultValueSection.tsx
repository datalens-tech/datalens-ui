import React from 'react';

import {DatePicker} from '@gravity-ui/date-components';
import {dateTimeUtc} from '@gravity-ui/date-utils';
import {RadioGroup, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {DATASET_FIELD_TYPES, DialogParameterQA, isDateField} from 'shared';

import type {UseParameterFormReturnValue} from './useParameterForm';

const b = block('dialog-parameter');
const i18n = I18n.keyset('component.dialog-parameter');
const BOOLEAN_STRING = {
    FALSE: 'false',
    TRUE: 'true',
};

interface Props {
    formState: UseParameterFormReturnValue['formState'];
    updateFormState: UseParameterFormReturnValue['updateFormState'];
}

const getDatePickerFormat = (
    type: DATASET_FIELD_TYPES,
    formatType: 'input' | 'output',
): string | undefined => {
    switch (type) {
        case DATASET_FIELD_TYPES.DATE:
        case DATASET_FIELD_TYPES.DATETIMETZ:
            return formatType === 'input' ? 'DD.MM.YYYY' : 'YYYY-MM-DD';
        case DATASET_FIELD_TYPES.GENERICDATETIME:
            return formatType === 'input' ? 'DD.MM.YYYY HH:mm:ss' : 'YYYY-MM-DD HH:mm:ss';
        default:
            return undefined;
    }
};

export function DefaultValueSection({formState, updateFormState}: Props) {
    let content: React.ReactNode;

    if (isDateField({data_type: formState.type})) {
        content = (
            <DatePicker
                value={formState.defaultValue ? dateTimeUtc({input: formState.defaultValue}) : null}
                format={getDatePickerFormat(formState.type, 'input')}
                onUpdate={(dateTime) => {
                    let value = '';

                    if (dateTime) {
                        const outputFormat = getDatePickerFormat(formState.type, 'output');
                        value = dateTime.format(outputFormat);
                    }

                    updateFormState({defaultValue: value});
                }}
            />
        );
    } else if (formState.type === DATASET_FIELD_TYPES.BOOLEAN) {
        content = (
            <RadioGroup
                value={formState.defaultValue || BOOLEAN_STRING.TRUE}
                onUpdate={(value) => {
                    updateFormState({defaultValue: value});
                }}
                qa={DialogParameterQA.DefaultValueRadioGroup}
            >
                <RadioGroup.Option value={BOOLEAN_STRING.TRUE}>
                    {i18n('parameter_true')}
                </RadioGroup.Option>
                <RadioGroup.Option value={BOOLEAN_STRING.FALSE}>
                    {i18n('parameter_false')}
                </RadioGroup.Option>
            </RadioGroup>
        );
    } else {
        content = (
            <TextInput
                value={formState.defaultValue}
                type="text"
                qa={DialogParameterQA.DefaultValueInput}
                pin="round-round"
                size="m"
                onUpdate={(value) => {
                    updateFormState({defaultValue: value});
                }}
            />
        );
    }

    return (
        <div className={b('line')}>
            <span className={b('line-title')}>{i18n('parameter_default-value')}</span>
            {content}
        </div>
    );
}
