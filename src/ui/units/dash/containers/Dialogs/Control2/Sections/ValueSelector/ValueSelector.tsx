import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {Checkbox, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {setSelectorDialogItem} from 'units/dash/store/actions/dashTyped';
import {
    selectIsDatasetSelectorAndNoFieldSelected,
    selectSelectorControlType,
    selectSelectorDefaultValue,
    selectSelectorDialog,
} from 'units/dash/store/selectors/dashTypedSelectors';

import {FilterValue} from '../../../../../../../../shared/modules';
import {DATASET_FIELD_TYPES} from '../../../../../../../../shared/types';
import DateDefaultValue from '../../../Control/Date/Default/Default';
import {CHECKBOX_CONTROL_VALUE} from '../../../Control/constants';

import {ListValueControl} from './ListValueControl/ListValueControl';

import './ValueSelector.scss';

const b = block('value-selector-wrapper');

const i18n = I18n.keyset('dash.control-dialog.edit');

const InputValueControl = () => {
    const dispatch = useDispatch();
    const defaultValue = useSelector(selectSelectorDefaultValue);
    const isFieldDisabled = useSelector(selectIsDatasetSelectorAndNoFieldSelected);

    const handleUpdate = React.useCallback((value: string) => {
        dispatch(
            setSelectorDialogItem({
                defaultValue: value,
            }),
        );
    }, []);

    return (
        <FormRow label={i18n('field_default-value')}>
            <TextInput
                disabled={isFieldDisabled}
                value={defaultValue as string}
                onUpdate={handleUpdate}
            />
        </FormRow>
    );
};

const DateValueControl = () => {
    const {isRange, acceptableValues, defaultValue, fieldType, sourceType} =
        useSelector(selectSelectorDialog);
    const isFieldDisabled = useSelector(selectIsDatasetSelectorAndNoFieldSelected);

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
                fieldType: value ? DATASET_FIELD_TYPES.DATETIME : undefined,
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
                    className={b('checkbox-option')}
                    checked={isRange}
                    disabled={isFieldDisabled}
                    onUpdate={handleIsRangeUpdate}
                    size="l"
                />
            </FormRow>

            {sourceType === 'manual' ? (
                <FormRow label={i18n('field_date-with-time')}>
                    <Checkbox
                        className={b('checkbox-option')}
                        checked={
                            fieldType === DATASET_FIELD_TYPES.DATETIME ||
                            fieldType === DATASET_FIELD_TYPES.GENERICDATETIME
                        }
                        disabled={isFieldDisabled}
                        onUpdate={handleTimeChange}
                        size="l"
                    />
                </FormRow>
            ) : null}
            <FormRow label={i18n('field_default-value')}>
                <DateDefaultValue
                    disabled={isFieldDisabled}
                    acceptableValues={acceptableValues}
                    defaultValue={defaultValue as string | undefined}
                    isRange={Boolean(isRange)}
                    onApply={handleDefaultValueChange}
                    fieldType={fieldType}
                />
            </FormRow>
        </React.Fragment>
    );
};

const CheckboxValueControl = () => {
    const dispatch = useDispatch();
    const defaultValue = useSelector(selectSelectorDefaultValue);
    const isFieldDisabled = useSelector(selectIsDatasetSelectorAndNoFieldSelected);

    // This is a forced setting of the default value so that the checkbox affects the dashboard immediately without switching it
    React.useEffect(() => {
        dispatch(
            setSelectorDialogItem({
                defaultValue: CHECKBOX_CONTROL_VALUE.FALSE,
            }),
        );
    }, [dispatch]);

    const handleUpdate = React.useCallback(
        (value: boolean) => {
            dispatch(
                setSelectorDialogItem({
                    defaultValue: String(value),
                }),
            );
        },
        [dispatch],
    );

    return (
        <FormRow label={i18n('field_default-value')}>
            <Checkbox
                className={b('checkbox-option')}
                disabled={isFieldDisabled}
                checked={defaultValue === CHECKBOX_CONTROL_VALUE.TRUE}
                onUpdate={handleUpdate}
                size="l"
            />
        </FormRow>
    );
};

const ValueSelector: React.FC = () => {
    const controlType = useSelector(selectSelectorControlType);

    let inputControl = null;

    switch (controlType) {
        case 'date': {
            inputControl = <DateValueControl />;
            break;
        }
        case 'select': {
            inputControl = <ListValueControl />;
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

    return inputControl;
};

export {ValueSelector};
