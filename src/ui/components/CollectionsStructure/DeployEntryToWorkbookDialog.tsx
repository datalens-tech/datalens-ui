import React from 'react';

import {I18n} from 'i18n';
import {useSelector} from 'react-redux';
import {AppDispatch} from 'ui/store';
import {closeDialog, openDialog} from 'ui/store/actions/dialog';

import DialogManager from '../../components/DialogManager/DialogManager';
import {selectIsLoadingMigrateEntriesToWorkbook} from '../../store/selectors/migrationToWorkbook';

import {CollectionStructureDialog, ResourceType} from './CollectionStructureDialog';

const i18n = I18n.keyset('component.collections-structure');

export const DIALOG_DEPLOY_ENTRY_TO_WORKBOOK = Symbol('DIALOG_DEPLOY_ENTRY_TO_WORKBOOK');

export type OpenDialogDeployEntryToWorkbookArgs = {
    id: typeof DIALOG_DEPLOY_ENTRY_TO_WORKBOOK;
    props: Props;
};

export type Props = {
    open: boolean;
    onApply: (workbookId: string) => void;
    onClose: () => void;
};

export const openDialogDeployEntryToWorkbook = ({onApply}: Props) => {
    return function (dispatch: AppDispatch) {
        dispatch(
            openDialog({
                id: DIALOG_DEPLOY_ENTRY_TO_WORKBOOK,
                props: {
                    open: true,
                    onApply: async (workbookId) => {
                        onApply(workbookId);
                    },
                    onClose: () => {
                        dispatch(closeDialog());
                    },
                },
            }),
        );
    };
};

export const DeployEntryToWorkbookDialog: React.FC<Props> = ({open, onApply, onClose}) => {
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
            caption={i18n('label_deploy')}
            textButtonApply={i18n('action_deploy')}
            operationDeniedMessage={i18n('label_deploy-denied-title')}
            applyIsLoading={isLoadingMigrateEntry}
            workbookSelectionMode={true}
            onApply={handleMigrateEntry}
            onClose={onClose}
        />
    );
};

DialogManager.registerDialog(DIALOG_DEPLOY_ENTRY_TO_WORKBOOK, DeployEntryToWorkbookDialog);
