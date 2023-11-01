import React from 'react';

import {I18n} from 'i18n';
import {useSelector} from 'react-redux';

import {selectCopyWorkbookIsLoading} from '../../store/selectors/collectionsStructure';
import DialogManager from '../DialogManager/DialogManager';

import {CollectionStructureDialog, ResourceType} from './CollectionStructureDialog';

const i18n = I18n.keyset('component.collections-structure');

export type Props = {
    open: boolean;
    onApply: (workbookId: string) => void;
    onClose: () => void;
};

export const DIALOG_COPY_ENTRIES = Symbol('DIALOG_COPY_ENTRIES');

export type OpenDialogCopyEntriesArgs = {
    id: typeof DIALOG_COPY_ENTRIES;
    props: Props;
};

export const CopyEntriesDialog: React.FC<Props> = ({open, onApply, onClose}) => {
    const copyIsLoading = useSelector(selectCopyWorkbookIsLoading);

    const handleEntryCopy = React.useCallback(
        async ({targetWorkbookId}: {targetWorkbookId: string | null}) => {
            if (targetWorkbookId) {
                await onApply(targetWorkbookId);
            }
        },
        [onApply],
    );

    return (
        <CollectionStructureDialog
            open={open}
            type={ResourceType.Workbook}
            initialCollectionId={null}
            caption={i18n('label_copy')}
            textButtonApply={i18n('action_copy')}
            operationDeniedMessage={i18n('label_copy-denied-title')}
            applyIsLoading={copyIsLoading}
            workbookSelectionMode={true}
            onApply={handleEntryCopy}
            onClose={onClose}
        />
    );
};

DialogManager.registerDialog(DIALOG_COPY_ENTRIES, CopyEntriesDialog);
