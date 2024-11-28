import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {Checkbox, TextInput} from '@gravity-ui/uikit';
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

export const TitleRow = () => {
    const dispatch = useDispatch();
    const {showTitle, title, validation} = useSelector(selectSelectorDialog);
    const isFieldDisabled = useSelector(selectIsControlConfigurationDisabled);

    const handleTitleUpdate = React.useCallback((title: string) => {
        dispatch(
            setSelectorDialogItem({
                title,
                isManualTitle: true,
            }),
        );
    }, []);

    const handleShowTitleUpdate = React.useCallback((value: boolean) => {
        dispatch(
            setSelectorDialogItem({
                showTitle: value,
            }),
        );
    }, []);

    return (
        <FormRow label={i18n('field_title')}>
            <div className={b('operation-container')} data-qa={DialogControlQa.appearanceTitle}>
                <Checkbox
                    disabled={isFieldDisabled}
                    className={b('operation-checkbox')}
                    qa={ControlQA.showLabelCheckbox}
                    checked={showTitle}
                    onUpdate={handleShowTitleUpdate}
                    size="l"
                />
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
