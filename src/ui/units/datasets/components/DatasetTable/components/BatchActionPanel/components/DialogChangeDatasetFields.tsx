import React from 'react';

import {Alert, Dialog} from '@gravity-ui/uikit';
import DialogManager from 'ui/components/DialogManager/DialogManager';

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
    onApply: () => void;
}

export const DialogChangeDatasetFields: React.FC<DialogChangeDatasetFieldsProps> = ({
    open,
    onClose,
    children,
    warningMessage,
    onApply,
}) => {
    return (
        <Dialog open={open} onClose={onClose} size="s">
            <Dialog.Body>
                <Alert theme="warning" message={warningMessage} />
                {children}
            </Dialog.Body>
            <Dialog.Footer
                textButtonCancel="Отменить"
                textButtonApply="Изменить"
                onClickButtonApply={onApply}
                onClickButtonCancel={onClose}
            />
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_CHANGE_DATASET_FIELDS, DialogChangeDatasetFields);
