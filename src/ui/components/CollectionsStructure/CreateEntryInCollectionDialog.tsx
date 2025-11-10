import React from 'react';

import {I18n} from 'i18n';
import {useHistory} from 'react-router-dom';

import DialogManager from '../DialogManager/DialogManager';

import {CollectionStructureDialog, ResourceType} from './CollectionStructureDialog';

const i18n = I18n.keyset('component.collections-structure');

export type CreateEntryInCollectionDialogProps = {
    entryType: 'connection' | 'dataset';
    closeDialogAfterSuccessfulApply?: boolean;
    disableHistoryPush?: boolean;
    initialCollectionId?: string | null;
    onClose: () => void;
    onApply?: (collectionId: string) => void;
};

export const DIALOG_CREATE_ENTRY_IN_COLLECTION = Symbol('DIALOG_CREATE_ENTRY_IN_COLLECTION');

export type OpenDialogCreateEntryInCollectionArgs = {
    id: typeof DIALOG_CREATE_ENTRY_IN_COLLECTION;
    props: CreateEntryInCollectionDialogProps;
};

export const CreateEntryInCollectionDialog: React.FC<CreateEntryInCollectionDialogProps> = ({
    entryType,
    closeDialogAfterSuccessfulApply,
    disableHistoryPush = false,
    initialCollectionId = null,
    onClose,
    onApply,
}) => {
    const history = useHistory();

    const handleCreateEntry = React.useCallback(
        async ({targetCollectionId}: {targetCollectionId: string | null}) => {
            if (targetCollectionId) {
                if (!disableHistoryPush) {
                    switch (entryType) {
                        case 'connection':
                            history.push(`/collections/${targetCollectionId}/connections/new`);
                            break;
                        case 'dataset':
                            history.push(`/collections/${targetCollectionId}/datasets/new`);
                            break;
                    }
                }
                if (onApply) {
                    onApply(targetCollectionId);
                }
            }
        },
        [entryType, history, disableHistoryPush, onApply],
    );

    return (
        <CollectionStructureDialog
            open={true}
            type={ResourceType.Collection}
            initialCollectionId={initialCollectionId}
            // TODO texts in CHARTS-11999
            caption={`Выберите коллекцию для создания ${i18n(`label_${entryType}`)}`}
            operationDeniedMessage={i18n('label_create-denied-title')}
            textButtonApply={i18n('action_create')}
            workbookSelectionMode={false}
            closeDialogAfterSuccessfulApply={closeDialogAfterSuccessfulApply}
            onApply={handleCreateEntry}
            onClose={onClose}
            useCustomDialog
        />
    );
};

DialogManager.registerDialog(DIALOG_CREATE_ENTRY_IN_COLLECTION, CreateEntryInCollectionDialog);
