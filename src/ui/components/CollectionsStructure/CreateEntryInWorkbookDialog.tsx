import React from 'react';

import {I18n} from 'i18n';
import {useHistory} from 'react-router-dom';

import DialogManager from '../DialogManager/DialogManager';

import {CollectionStructureDialog, ResourceType} from './CollectionStructureDialog';

const i18n = I18n.keyset('component.collections-structure');

export type CreateEntryInWorkbookDialogProps = {
    entryType: 'connection' | 'dataset' | 'wizard' | 'ql' | 'dashboard';
    closeDialogAfterSuccessfulApply?: boolean;
    disableHistoryPush?: boolean;
    initialCollectionId?: string | null;
    onClose: () => void;
    onApply?: (workbookId: string) => void;
};

export const DIALOG_CREATE_ENTRY_IN_WORKBOOK = Symbol('DIALOG_CREATE_ENTRY_IN_WORKBOOK');

export type OpenDialogCreateEntryInWorkbookArgs = {
    id: typeof DIALOG_CREATE_ENTRY_IN_WORKBOOK;
    props: CreateEntryInWorkbookDialogProps;
};

export const CreateEntryInWorkbookDialog: React.FC<CreateEntryInWorkbookDialogProps> = ({
    entryType,
    closeDialogAfterSuccessfulApply,
    disableHistoryPush = false,
    initialCollectionId = null,
    onClose,
    onApply,
}) => {
    const history = useHistory();

    const handleCreateEntry = React.useCallback(
        ({targetWorkbookId}: {targetWorkbookId: string | null}) => {
            if (targetWorkbookId) {
                if (!disableHistoryPush) {
                    switch (entryType) {
                        case 'connection':
                            history.push(`/workbooks/${targetWorkbookId}/connections/new`);
                            break;
                        case 'dataset':
                            history.push(`/workbooks/${targetWorkbookId}/datasets/new`);
                            break;
                        case 'wizard':
                            history.push(`/workbooks/${targetWorkbookId}/wizard`);
                            break;
                        case 'ql':
                            history.push(`/workbooks/${targetWorkbookId}/ql`);
                            break;
                        case 'dashboard': {
                            history.push(`/workbooks/${targetWorkbookId}/dashboards`);
                            break;
                        }
                    }
                }
                if (onApply) {
                    onApply(targetWorkbookId);
                }
            }
            return Promise.resolve();
        },
        [entryType, history, disableHistoryPush, onApply],
    );

    return (
        <CollectionStructureDialog
            open={true}
            type={ResourceType.Workbook}
            initialCollectionId={initialCollectionId}
            caption={`${i18n('label_create-entry-in-workbook')} ${i18n(`label_${entryType}`)}`}
            operationDeniedMessage={i18n('label_create-denied-title')}
            textButtonApply={i18n('action_create')}
            workbookSelectionMode={true}
            closeDialogAfterSuccessfulApply={closeDialogAfterSuccessfulApply}
            onApply={handleCreateEntry}
            onClose={onClose}
        />
    );
};

DialogManager.registerDialog(DIALOG_CREATE_ENTRY_IN_WORKBOOK, CreateEntryInWorkbookDialog);
