import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {Checkbox} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';

import {registry} from '../../../../../../../../../registry';
import {setSelectorDialogItem} from '../../../../../../../store/actions/dashTyped';
import {
    getDatasetField,
    selectIsControlConfigurationDisabled,
    selectSelectorDialog,
} from '../../../../../../../store/selectors/dashTypedSelectors';

const b = block('control2-appearance-section');

const i18n = I18n.keyset('dash.control-dialog.edit');

export const HintRow = () => {
    const dispatch = useDispatch();
    const {showHint, hint} = useSelector(selectSelectorDialog);
    const isFieldDisabled = useSelector(selectIsControlConfigurationDisabled);
    const datasetField = useSelector(getDatasetField);
    const hintValue = hint ?? datasetField?.description ?? '';

    const handleUpdateEnable = React.useCallback(
        (checked: boolean) => dispatch(setSelectorDialogItem({showHint: checked, hint: hintValue})),
        [dispatch, hintValue],
    );

    const handleUpdateText = React.useCallback(
        (value: string) => dispatch(setSelectorDialogItem({hint: value})),
        [dispatch],
    );

    const {MarkdownControl} = registry.common.components.getAll();

    return (
        <FormRow label={i18n('field_hint')}>
            <div className={b('operation-container')}>
                <Checkbox
                    disabled={isFieldDisabled}
                    onUpdate={handleUpdateEnable}
                    checked={showHint}
                    size={'l'}
                    className={b('operation-checkbox', {top: true})}
                />
                <MarkdownControl
                    value={hintValue}
                    onChange={handleUpdateText}
                    disabled={isFieldDisabled || !showHint}
                />
            </div>
        </FormRow>
    );
};
