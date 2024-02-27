import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {TextInput} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';
import {DialogControlQa} from 'shared';

import {FieldWrapper} from '../../../../../../../../components/FieldWrapper/FieldWrapper';
import {setSelectorDialogItem} from '../../../../../../store/actions/dashTyped';
import {selectSelectorDialog} from '../../../../../../store/selectors/dashTypedSelectors';

export type ParameterNameInputProps = {
    label: string;
};
export const ParameterNameInput: React.FC<ParameterNameInputProps> = (
    props: ParameterNameInputProps,
) => {
    const dispatch = useDispatch();
    const {fieldName, validation} = useSelector(selectSelectorDialog);

    const {label} = props;

    const handleFieldNameUpdate = React.useCallback((value: string) => {
        dispatch(
            setSelectorDialogItem({
                fieldName: value,
            }),
        );
    }, []);

    const value = fieldName ?? '';

    return (
        <FormRow label={label}>
            <FieldWrapper error={validation.fieldName}>
                <TextInput
                    qa={DialogControlQa.fieldNameInput}
                    value={value}
                    onUpdate={handleFieldNameUpdate}
                />
            </FieldWrapper>
        </FormRow>
    );
};
