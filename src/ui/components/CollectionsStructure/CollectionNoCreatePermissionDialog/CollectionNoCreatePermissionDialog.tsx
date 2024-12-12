import React from 'react';

import {I18n} from 'i18n';
import {YfmWrapperContent as YfmWrapper} from '../../YfmWrapper/YfmWrapperContent';
import DialogInfo from 'ui/components/DialogInfo/DialogInfo';
import DialogManager from '../../DialogManager/DialogManager';
const i18n = I18n.keyset('component.dialog-collection-no-create-permission.view');
export const DIALOG_NO_CREATE_COLLECTION_PERMISSION = Symbol('DIALOG_CREATE_WORKBOOK');

export type Props = {
    message?: React.ReactNode;
    visible: boolean;
    onClose: () => void;
};

export type OpenDialogCollectionNoCreatePermissionArgs = {
    id: typeof DIALOG_NO_CREATE_COLLECTION_PERMISSION,
    props: Props
}

export const CollectionNoCreatePermissionDialog = React.memo<Props>(
    ({visible, onClose}) => {
        return (
            <DialogInfo
                visible={visible}
                onСlose={onClose}
                closeOnEnterPress={true}
                headerText={i18n('title')}
                message={
                    <YfmWrapper
                        content={i18n('description')}
                        setByInnerHtml={true}
                    />
                }
                isWarning={true}
            />
        );
    },
);

CollectionNoCreatePermissionDialog.displayName = 'CollectionNoCreatePermissionDialog';

DialogManager.registerDialog(DIALOG_NO_CREATE_COLLECTION_PERMISSION, CollectionNoCreatePermissionDialog);