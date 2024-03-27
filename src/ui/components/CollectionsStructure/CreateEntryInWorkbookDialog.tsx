import React from 'react';

import {I18n} from 'i18n';
import {useHistory} from 'react-router-dom';

import DialogManager from '../DialogManager/DialogManager';

import {CollectionStructureDialog, ResourceType} from './CollectionStructureDialog';

const i18n = I18n.keyset('component.collections-structure');

export type Props = {
    open: boolean;
    initialCollectionId?: string | null;
    entryType: 'connection' | 'dataset' | 'wizard' | 'ql' | 'dashboard';
    onApply?: (workbookId: string) => void;
    onClose: () => void;
};

export const DIALOG_CREATE_ENTRY_IN_WORKBOOK = Symbol('DIALOG_CREATE_ENTRY_IN_WORKBOOK');

export type OpenDialogCreateEntryInWorkbookArgs = {
    id: typeof DIALOG_CREATE_ENTRY_IN_WORKBOOK;
    props: Props;
};

export const CreateEntryInWorkbookDialog: React.FC<Props> = ({
    open,
    initialCollectionId = null,
    entryType,
    onApply,
    onClose,
}) => {
    const history = useHistory();

    const handleCreateEntry = React.useCallback(
        ({targetWorkbookId}: {targetWorkbookId: string | null}) => {
            if (targetWorkbookId) {
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
                if (onApply) {
                    onApply(targetWorkbookId);
                }
            }
            return Promise.resolve();
        },
        [entryType, history, onApply],
    );

    return (
        <CollectionStructureDialog
            open={open}
            type={ResourceType.Workbook}
            initialCollectionId={initialCollectionId}
            caption={`${i18n('label_create-entry-in-workbook')} ${i18n(`label_${entryType}`)}`}
            textButtonApply={i18n('action_create')}
            workbookSelectionMode={true}
            onApply={handleCreateEntry}
            onClose={onClose}
        />
    );
};

DialogManager.registerDialog(DIALOG_CREATE_ENTRY_IN_WORKBOOK, CreateEntryInWorkbookDialog);
