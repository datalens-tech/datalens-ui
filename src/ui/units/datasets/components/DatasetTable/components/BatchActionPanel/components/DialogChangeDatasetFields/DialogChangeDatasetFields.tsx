import React from 'react';

import {Alert, Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import DialogManager from 'ui/components/DialogManager/DialogManager';

import './DialogChangeDatasetFields.scss';

const b = block('dl-dataset-dialog-change-fields');
const i18n = I18n.keyset('dataset.dataset-editor.modify');

export const DIALOG_CHANGE_DATASET_FIELDS = Symbol('DIALOG_CHANGE_DATASET_FIELDS');

export type OpenDialogChangeDatasetFieldsArgs = {
    id: typeof DIALOG_CHANGE_DATASET_FIELDS;
    props: DialogChangeDatasetFieldsProps;
};

export interface DialogChangeDatasetFieldsProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactElement;
    warningMessage: string;
    title: string;
    onApply: () => void;
}

export const DialogChangeDatasetFields: React.FC<DialogChangeDatasetFieldsProps> = ({
    open,
    onClose,
    children,
    warningMessage,
    onApply,
    title,
}) => {
    return (
        <Dialog open={open} onClose={onClose} size="s">
            <Dialog.Header caption={title} />
            <Dialog.Body>
                <Alert theme="warning" message={warningMessage} />
                <div className={b('children')}>{children}</div>
            </Dialog.Body>
            <Dialog.Footer
                textButtonCancel={i18n('button_batch-cancel')}
                textButtonApply={i18n('button_batch-apply')}
                onClickButtonApply={onApply}
                onClickButtonCancel={onClose}
            />
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_CHANGE_DATASET_FIELDS, DialogChangeDatasetFields);
