import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {HelpMark, TextInput} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';
import {DialogControlQa} from 'shared';
import {YfmWrapper} from 'ui/components/YfmWrapper/YfmWrapper';
import {setSelectorDialogItem} from 'ui/store/actions/controlDialog';
import {selectSelectorDialog} from 'ui/store/selectors/controlDialog';

import {FieldWrapper} from '../../../../FieldWrapper/FieldWrapper';

export type ParameterNameInputProps = {
    label: string;
    note?: string;
    className?: string;
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
            <HelpMark
                popoverProps={{
                    placement: ['bottom', 'top'],
                }}
                style={{left: 5}}
            >
                <YfmWrapper content={props.note} setByInnerHtml={true} />
            </HelpMark>
        </React.Fragment>
    ) : (
        props.label
    );

    return (
        <FormRow label={label} className={props.className}>
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
