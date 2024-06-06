import React from 'react';

import {FormRow} from '@gravity-ui/components';
import type {SelectOption} from '@gravity-ui/uikit';
import {Select} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {DialogControlQa} from 'shared';
import {SelectOptionWithIcon} from 'ui/components/SelectComponents/components/SelectOptionWithIcon/SelectOptionWithIcon';
import type {SelectorElementType} from 'units/dash/store/actions/dashTyped';
import {setSelectorDialogItem} from 'units/dash/store/actions/dashTyped';
import {
    selectIsControlConfigurationDisabled,
    selectSelectorControlType,
} from 'units/dash/store/selectors/dashTypedSelectors';

const i18n = I18n.keyset('dash.control-dialog.edit');

const renderOptions = (option: SelectOption) => <SelectOptionWithIcon option={option} />;

type InputTypeSelectorProps = {
    options: SelectOption[];
};

const InputTypeSelector: React.FC<InputTypeSelectorProps> = (props: InputTypeSelectorProps) => {
    const dispatch = useDispatch();
    const controlType = useSelector(selectSelectorControlType);
    const isFieldDisabled = useSelector(selectIsControlConfigurationDisabled);

    const {options} = props;

    const handleInputTypeChange = React.useCallback(
        (value: string[]) => {
            dispatch(
                setSelectorDialogItem({
                    elementType: value[0] as SelectorElementType,
                }),
            );
        },
        [dispatch],
    );

    return (
        <FormRow label={i18n('field_selector-type')}>
            <Select
                value={[controlType]}
                disabled={isFieldDisabled}
                onUpdate={handleInputTypeChange}
                width="max"
                qa={DialogControlQa.elementTypeSelect}
                options={options}
                renderOption={renderOptions}
                renderSelectedOption={renderOptions}
            />
        </FormRow>
    );
};

export {InputTypeSelector};
