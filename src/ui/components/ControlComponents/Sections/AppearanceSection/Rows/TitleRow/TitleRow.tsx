import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {FieldWrapper} from 'components/FieldWrapper/FieldWrapper';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {ControlQA, DialogControlQa} from 'shared';
import {setSelectorDialogItem} from 'ui/store/actions/controlDialog';
import {
    selectIsControlConfigurationDisabled,
    selectSelectorDialog,
} from 'ui/store/selectors/controlDialog';

import '../../AppearanceSection.scss';

const b = block('control2-appearance-section');

const i18n = I18n.keyset('dash.control-dialog.edit');

export const TitleRow = ({className}: {className?: string}) => {
    const dispatch = useDispatch();
    const {title, validation} = useSelector(selectSelectorDialog);
    const isFieldDisabled = useSelector(selectIsControlConfigurationDisabled);

    const handleTitleUpdate = React.useCallback((title: string) => {
        dispatch(
            setSelectorDialogItem({
                title,
                isManualTitle: true,
            }),
        );
    }, []);

    return (
        <FormRow label={i18n('field_title')} className={className}>
            <div className={b('setting-container')} data-qa={DialogControlQa.appearanceTitle}>
                <FieldWrapper error={validation.title}>
                    <TextInput
                        disabled={isFieldDisabled}
                        qa={ControlQA.inputNameControl}
                        value={title}
                        onUpdate={handleTitleUpdate}
                    />
                </FieldWrapper>
            </div>
        </FormRow>
    );
};
