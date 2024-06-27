import React from 'react';

import {FormRow, HelpPopover} from '@gravity-ui/components';
import {TextInput} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';
import {DialogControlQa} from 'shared';

import {FieldWrapper} from '../../../../../../../../components/FieldWrapper/FieldWrapper';
import {setSelectorDialogItem} from '../../../../../../store/actions/dashTyped';
import {selectSelectorDialog} from '../../../../../../store/selectors/dashTypedSelectors';

export type ParameterNameInputProps = {
    label: string;
    note?: string;
};
export const ParameterNameInput: React.FC<ParameterNameInputProps> = (
    props: ParameterNameInputProps,
) => {
    const dispatch = useDispatch();
    const {fieldName, validation} = useSelector(selectSelectorDialog);

    const handleFieldNameUpdate = React.useCallback((value: string) => {
        dispatch(
            setSelectorDialogItem({
                fieldName: value,
            }),
        );
    }, []);

    const value = fieldName ?? '';

    const label = props.note ? (
        <React.Fragment>
            <span>{props.label}</span>
            <HelpPopover
                htmlContent={props.note}
                placement={['bottom', 'top']}
                offset={{top: -1, left: 5}}
            />
        </React.Fragment>
    ) : (
        props.label
    );

    return (
        <FormRow label={label}>
            <FieldWrapper error={validation.fieldName || validation.uniqueFieldName}>
                <TextInput
                    qa={DialogControlQa.fieldNameInput}
                    value={value}
                    onUpdate={handleFieldNameUpdate}
                />
            </FieldWrapper>
        </FormRow>
    );
};
