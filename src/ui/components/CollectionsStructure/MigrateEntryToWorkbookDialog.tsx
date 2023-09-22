import React from 'react';

import {I18n} from 'i18n';
import {useSelector} from 'react-redux';

import DialogManager from '../../components/DialogManager/DialogManager';
import {selectIsLoadingMigrateEntriesToWorkbook} from '../../store/selectors/migrationToWorkbook';

import {CollectionStructureDialog, ResourceType} from './CollectionStructureDialog';

const i18n = I18n.keyset('component.collections-structure');

export type Props = {
    open: boolean;
    onApply: (workbookId: string) => void;
    onClose: () => void;
};

export const DIALOG_MIGRATE_ENTRY_TO_WORKBOOK = Symbol('DIALOG_MIGRATE_ENTRY_TO_WORKBOOK');

export type OpenDialogMigrateEntryToWorkbookArgs = {
    id: typeof DIALOG_MIGRATE_ENTRY_TO_WORKBOOK;
    props: Props;
};

export const MigrateEntryToWorkbookDialog: React.FC<Props> = ({open, onApply, onClose}) => {
    const handleMigrateEntry = React.useCallback(
        async ({
            targetWorkbookId,
        }: {
            targetCollectionId: string | null;
            targetWorkbookId: string | null;
            targetTitle?: string;
        }) => {
            if (targetWorkbookId) {
                await onApply(targetWorkbookId);
            }
        },
        [onApply],
    );

    const isLoadingMigrateEntry = useSelector(selectIsLoadingMigrateEntriesToWorkbook);

    return (
        <CollectionStructureDialog
            open={open}
            type={ResourceType.Workbook}
            initialCollectionId={null}
            canSelectInitialCollectionId={false}
            caption={i18n('label_move')}
            textButtonApply={i18n('action_move')}
            operationDeniedMessage={i18n('label_move-denied-title')}
            applyIsLoading={isLoadingMigrateEntry}
            workbookSelectionMode={true}
            onApply={handleMigrateEntry}
            onClose={onClose}
        />
    );
};

DialogManager.registerDialog(DIALOG_MIGRATE_ENTRY_TO_WORKBOOK, MigrateEntryToWorkbookDialog);
