import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {Checkbox} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {DialogControlQa} from 'shared';
import {setSelectorDialogItem} from 'units/dash/store/actions/dashTyped';
import {
    selectIsControlConfigurationDisabled,
    selectSelectorControlType,
    selectSelectorRequired,
} from 'units/dash/store/selectors/dashTypedSelectors';

import {ELEMENT_TYPE} from '../../../../Control/constants';

import '../ValueSelector.scss';

const i18n = I18n.keyset('dash.control-dialog.edit');

const b = block('value-selector-wrapper');

export const RequiredValueCheckbox = () => {
    const dispatch = useDispatch();
    const required = useSelector(selectSelectorRequired);

    const elementType = useSelector(selectSelectorControlType);
    const isNoFieldSelected = useSelector(selectIsControlConfigurationDisabled);
    const isFieldDisabled = isNoFieldSelected || elementType === ELEMENT_TYPE.CHECKBOX;

    const handleUpdate = (value: boolean) => {
        dispatch(
            setSelectorDialogItem({
                required: value,
            }),
        );
    };

    const value = required ?? false;

    return (
        <FormRow label={i18n('field_required-value')}>
            <Checkbox
                className={b('checkbox-option')}
                disabled={isFieldDisabled}
                checked={value}
                onUpdate={handleUpdate}
                size="l"
                qa={DialogControlQa.requiredValueCheckbox}
            />
        </FormRow>
    );
};
