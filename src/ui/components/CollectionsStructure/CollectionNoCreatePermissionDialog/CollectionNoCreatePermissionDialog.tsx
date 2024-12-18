import React from 'react';

import {I18n} from 'i18n';
import DialogWarning from 'ui/components/DialogWarning/DialogWarning';

import {registry} from '../../../registry';
import DialogManager from '../../DialogManager/DialogManager';
import {YfmWrapperContent as YfmWrapper} from '../../YfmWrapper/YfmWrapperContent';

const i18n = I18n.keyset('component.dialog-collection-no-create-permission.view');

export const DIALOG_NO_CREATE_COLLECTION_PERMISSION = Symbol(
    'DIALOG_NO_CREATE_COLLECTION_PERMISSION',
);

export type Props = {
    visible: boolean;
    onClose: () => void;
};

export type OpenDialogCollectionNoCreatePermissionArgs = {
    id: typeof DIALOG_NO_CREATE_COLLECTION_PERMISSION;
    props: Props;
};

export const CollectionNoCreatePermissionDialog = ({visible, onClose}: Props) => {
    const {customizeNoCreatePermissionDialog} = registry.collections.functions.getAll();

    const {message} = customizeNoCreatePermissionDialog({
        message: <YfmWrapper content={i18n('section_message')} setByInnerHtml={true} />,
    });

    return (
        <DialogWarning
            visible={visible}
            onApply={onClose}
            showIcon={false}
            closeOnEnterPress={true}
            headerText={i18n('label_title')}
            buttonText={i18n('button_ok')}
            message={message}
        />
    );
};

CollectionNoCreatePermissionDialog.displayName = 'CollectionNoCreatePermissionDialog';

DialogManager.registerDialog(
    DIALOG_NO_CREATE_COLLECTION_PERMISSION,
    CollectionNoCreatePermissionDialog,
);
