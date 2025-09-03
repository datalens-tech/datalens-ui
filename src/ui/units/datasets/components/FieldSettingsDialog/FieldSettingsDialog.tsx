import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {BucketPaint} from '@gravity-ui/icons';
import {Button, Dialog, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {DatasetField} from 'shared';
import {isNumberField} from 'shared';
import {NumberFormatSettings} from 'ui/components/NumberFormatSettings/NumberFormatSettings';

import {isFieldWithDisplaySettings} from '../DatasetTable/utils';

import './FieldSettingsDialog.scss';

const i18n = I18n.keyset('dataset.field-settings-dialog.modify');

const b = block('field-settings-dialog');

type Props = {
    open: boolean;
    field: DatasetField | null;
    onClose: () => void;
};

export const FieldSettingsDialog = (props: Props) => {
    const {open, field, onClose} = props;
    const hasDisplaySettings = field && isFieldWithDisplaySettings({field});

    const handleReset = () => {};

    const handleSave = () => {
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    const handleChangeFieldFormatting = () => {};

    const renderFormattingSection = () => {
        if (field && isNumberField(field)) {
            return (
                <NumberFormatSettings
                    dataType={field.data_type}
                    onChange={handleChangeFieldFormatting}
                    rowClassName={b('row')}
                />
            );
        }

        return null;
    };

    return (
        <Dialog onClose={onClose} open={open} className={b()}>
            <Dialog.Header caption={i18n('label_title')} />
            <Dialog.Body>
                <FormRow className={b('row')} label={i18n('label_colors')}>
                    <Button>
                        <Icon data={BucketPaint} width="16" height="16" />
                        {i18n('button_colors')}
                    </Button>
                </FormRow>
                {renderFormattingSection()}
            </Dialog.Body>
            <Dialog.Footer>
                <div className={b('footer')}>
                    <Button
                        size="l"
                        view="outlined"
                        className={b('btn-reset')}
                        onClick={handleReset}
                        disabled={!hasDisplaySettings}
                    >
                        {i18n('button_reset')}
                    </Button>
                    <Button size="l" view="flat" onClick={handleCancel}>
                        {i18n('button_cancel')}
                    </Button>
                    <Button size="l" view="action" onClick={handleSave}>
                        {i18n('button_save')}
                    </Button>
                </div>
            </Dialog.Footer>
        </Dialog>
    );
};
