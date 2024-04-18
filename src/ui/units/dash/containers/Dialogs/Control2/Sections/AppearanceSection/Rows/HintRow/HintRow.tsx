import React from 'react';

import {FormRow} from '@gravity-ui/components';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {FieldHintSetting} from 'ui/components/FieldHintSetting/FieldHintSetting';
import {FieldWrapper} from 'ui/components/FieldWrapper/FieldWrapper';
import {setSelectorDialogItem} from 'units/dash/store/actions/dashTyped';
import {
    getDatasetField,
    selectIsControlConfigurationDisabled,
    selectSelectorDialog,
} from 'units/dash/store/selectors/dashTypedSelectors';

import '../../AppearanceSection.scss';

const b = block('control2-appearance-section');

const i18n = I18n.keyset('dash.control-dialog.edit');

export const HintRow = () => {
    const dispatch = useDispatch();
    const {hint, validation} = useSelector(selectSelectorDialog);
    const isFieldDisabled = useSelector(selectIsControlConfigurationDisabled);
    const datasetField = useSelector(getDatasetField);

    const handleHintUpdate = React.useCallback(
        (value: string) => {
            dispatch(
                setSelectorDialogItem({
                    hint: value,
                }),
            );
        },
        [dispatch],
    );

    return (
        <FormRow label={i18n('field_hint')}>
            <div className={b('operation-container')}>
                <FieldWrapper error={validation.title}>
                    <FieldHintSetting
                        hint={hint}
                        fieldDescription={datasetField?.description}
                        onChange={handleHintUpdate}
                        disabled={isFieldDisabled}
                    />
                </FieldWrapper>
            </div>
        </FormRow>
    );
};
