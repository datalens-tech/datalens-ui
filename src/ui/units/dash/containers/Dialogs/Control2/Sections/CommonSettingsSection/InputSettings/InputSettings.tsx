import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {TextInput} from '@gravity-ui/uikit';
import {FieldWrapper} from 'components/FieldWrapper/FieldWrapper';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {DialogControlQa} from 'shared/constants/qa/control';
import {setSelectorDialogItem} from 'units/dash/store/actions/dashTyped';
import {selectSelectorDialog} from 'units/dash/store/selectors/dashTypedSelectors';

import {SectionWrapper} from '../../../../../../../../components/SectionWrapper/SectionWrapper';
import {OperationSelector} from '../../OperationSelector/OperationSelector';
import {ValueSelector} from '../../ValueSelector/ValueSelector';
import {InputTypeSelector} from '../InputTypeSelector/InputTypeSelector';

const i18n = I18n.keyset('dash.control-dialog.edit');

type InputSettingsProps = {
    isSectionHidden?: boolean;
};

const InputSettings = ({isSectionHidden}: InputSettingsProps) => {
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

    return (
        <React.Fragment>
            <SectionWrapper
                isStylesHidden={isSectionHidden}
                title={isSectionHidden ? '' : i18n('label_common-settings')}
            >
                <FormRow label={i18n('field_field-name')}>
                    <FieldWrapper error={validation.fieldName}>
                        <TextInput
                            qa={DialogControlQa.fieldNameInput}
                            value={value}
                            onUpdate={handleFieldNameUpdate}
                        />
                    </FieldWrapper>
                </FormRow>
                <InputTypeSelector />
                <OperationSelector />
                <ValueSelector />
            </SectionWrapper>
        </React.Fragment>
    );
};

export {InputSettings};
