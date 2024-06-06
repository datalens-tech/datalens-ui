import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {Checkbox, RadioGroup, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {DialogControlQa} from 'shared';
import {FieldWrapper} from 'ui/components/FieldWrapper/FieldWrapper';
import {registry} from 'ui/registry';
import {setSelectorDialogItem} from 'units/dash/store/actions/dashTyped';
import {
    selectIsControlConfigurationDisabled,
    selectSelectorControlType,
    selectSelectorDefaultValue,
    selectSelectorDialog,
    selectSelectorValidation,
} from 'units/dash/store/selectors/dashTypedSelectors';

import type {FilterValue} from '../../../../../../../../shared/modules';
import {DATASET_FIELD_TYPES} from '../../../../../../../../shared/types';
import DateDefaultValue from '../../../Control/Date/Default/Default';
import {CheckboxControlValue} from '../../../Control/constants';

import {ListValueControl} from './ListValueControl/ListValueControl';
import {RequiredValueCheckbox} from './RequiredValueCheckbox/RequiredValueCheckbox';
import type {ValueSelectorControlProps} from './types';

import './ValueSelector.scss';

const b = block('value-selector-wrapper');

const i18n = I18n.keyset('dash.control-dialog.edit');

const InputValueControl = () => {
    const dispatch = useDispatch();
    const defaultValue = useSelector(selectSelectorDefaultValue);
    const isFieldDisabled = useSelector(selectIsControlConfigurationDisabled);
    const validation = useSelector(selectSelectorValidation);

    const handleUpdate = React.useCallback((value: string) => {
        dispatch(
            setSelectorDialogItem({
                defaultValue: value,
            }),
        );
    }, []);

    return (
        <FormRow label={i18n('field_default-value')}>
            <FieldWrapper error={validation.defaultValue}>
                <TextInput
                    disabled={isFieldDisabled}
                    value={(defaultValue ?? '') as string}
                    onUpdate={handleUpdate}
                />
            </FieldWrapper>
        </FormRow>
    );
};

const DateValueControl = () => {
    const {isRange, acceptableValues, defaultValue, fieldType, sourceType} =
        useSelector(selectSelectorDialog);
    const isFieldDisabled = useSelector(selectIsControlConfigurationDisabled);
    const validation = useSelector(selectSelectorValidation);

    const dispatch = useDispatch();

    const handleIsRangeUpdate = React.useCallback((value: boolean) => {
        dispatch(
            setSelectorDialogItem({
                isRange: value,
                defaultValue: undefined,
            }),
        );
    }, []);

    const handleTimeChange = React.useCallback((value: boolean) => {
        dispatch(
            setSelectorDialogItem({
                fieldType: value ? DATASET_FIELD_TYPES.GENERICDATETIME : undefined,
                defaultValue: undefined,
            }),
        );
    }, []);

    const handleDefaultValueChange = React.useCallback((value: {defaultValue: FilterValue}) => {
        dispatch(
            setSelectorDialogItem({
                defaultValue: value.defaultValue!,
            }),
        );
    }, []);

    return (
        <React.Fragment>
            <FormRow label={i18n('field_date-range')}>
                <Checkbox
                    qa={DialogControlQa.dateRangeCheckbox}
                    className={b('checkbox-option')}
                    checked={isRange ?? false}
                    disabled={isFieldDisabled}
                    onUpdate={handleIsRangeUpdate}
                    size="l"
                />
            </FormRow>

            {sourceType === 'manual' ? (
                <FormRow label={i18n('field_date-with-time')}>
                    <Checkbox
                        qa={DialogControlQa.dateTimeCheckbox}
                        className={b('checkbox-option')}
                        checked={fieldType === DATASET_FIELD_TYPES.GENERICDATETIME}
                        disabled={isFieldDisabled}
                        onUpdate={handleTimeChange}
                        size="l"
                    />
                </FormRow>
            ) : null}
            <FormRow label={i18n('field_default-value')}>
                <FieldWrapper error={validation.defaultValue}>
                    <DateDefaultValue
                        disabled={isFieldDisabled}
                        acceptableValues={acceptableValues}
                        defaultValue={defaultValue as string | undefined}
                        isRange={Boolean(isRange)}
                        onApply={handleDefaultValueChange}
                        fieldType={fieldType}
                        hasValidationError={Boolean(validation.defaultValue)}
                    />
                </FieldWrapper>
            </FormRow>
        </React.Fragment>
    );
};

const CheckboxValueControl = () => {
    const dispatch = useDispatch();
    const defaultValue = useSelector(selectSelectorDefaultValue);
    const isFieldDisabled = useSelector(selectIsControlConfigurationDisabled);

    const handleUpdate = React.useCallback(
        (value: string) => {
            dispatch(
                setSelectorDialogItem({
                    defaultValue: value,
                }),
            );
        },
        [dispatch],
    );

    return (
        <FormRow label={i18n('field_default-value')}>
            <RadioGroup
                className={b('radio-option')}
                onUpdate={handleUpdate}
                disabled={isFieldDisabled}
                defaultValue={CheckboxControlValue.FALSE}
                value={defaultValue as CheckboxControlValue | undefined}
            >
                <RadioGroup.Option
                    value={CheckboxControlValue.TRUE}
                    content={i18n('value_checkbox-default-value-true')}
                />
                <RadioGroup.Option
                    value={CheckboxControlValue.FALSE}
                    content={i18n('value_checkbox-default-value-false')}
                />
            </RadioGroup>
        </FormRow>
    );
};

type ValueSelectorProps = {
    controlProps: ValueSelectorControlProps;
};

const ValueSelector: React.FC<ValueSelectorProps> = (props: ValueSelectorProps) => {
    const controlType = useSelector(selectSelectorControlType);

    const {useExtendedValueSelector} = registry.dash.functions.getAll();

    let inputControl = useExtendedValueSelector(controlType);

    if (inputControl) {
        return inputControl;
    }

    switch (controlType) {
        case 'date': {
            inputControl = <DateValueControl />;
            break;
        }
        case 'select': {
            inputControl = <ListValueControl {...props.controlProps.select} />;
            break;
        }
        case 'input': {
            inputControl = <InputValueControl />;
            break;
        }
        case 'checkbox': {
            inputControl = <CheckboxValueControl />;
        }
    }

    return (
        <React.Fragment>
            <RequiredValueCheckbox />
            {inputControl}
        </React.Fragment>
    );
};

export {ValueSelector};
