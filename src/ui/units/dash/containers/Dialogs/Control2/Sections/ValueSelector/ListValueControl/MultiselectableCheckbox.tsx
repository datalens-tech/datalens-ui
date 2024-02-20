import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {Checkbox} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {setSelectorDialogItem} from 'units/dash/store/actions/dashTyped';
import {
    selectIsDatasetSelectorAndNoFieldSelected,
    selectSelectorDialog,
} from 'units/dash/store/selectors/dashTypedSelectors';

import '../ValueSelector.scss';

const b = block('value-selector-wrapper');

const i18n = I18n.keyset('dash.control-dialog.edit');

export const MultiselectableCheckbox = () => {
    const dispatch = useDispatch();
    const {multiselectable} = useSelector(selectSelectorDialog);
    const isFieldDisabled = useSelector(selectIsDatasetSelectorAndNoFieldSelected);

    const handleUpdate = React.useCallback(
        (value: boolean) => {
            dispatch(
                setSelectorDialogItem({
                    multiselectable: value,
                }),
            );
        },
        [dispatch],
    );

    return (
        <FormRow label={i18n('field_multiselectable')}>
            <Checkbox
                className={b('checkbox-option')}
                disabled={isFieldDisabled}
                checked={multiselectable ?? false}
                onUpdate={handleUpdate}
                size="l"
            />
        </FormRow>
    );
};
