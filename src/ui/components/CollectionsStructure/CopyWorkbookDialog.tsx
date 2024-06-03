import React from 'react';

import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {WorkbookId} from 'shared';

import DialogManager from '../../components/DialogManager/DialogManager';
import type {CollectionsStructureDispatch} from '../../store/actions/collectionsStructure';
import {copyWorkbook} from '../../store/actions/collectionsStructure';
import {selectCopyWorkbookIsLoading} from '../../store/selectors/collectionsStructure';

import {CollectionStructureDialog, ResourceType} from './CollectionStructureDialog';

const i18n = I18n.keyset('component.collections-structure');

export type Props = {
    open: boolean;
    workbookId: string;
    workbookTitle: string;
    initialCollectionId?: string | null;
    onApply: (workbookId?: string) => void;
    onClose: (structureChanged: boolean) => void;
};

export const DIALOG_COPY_WORKBOOK = Symbol('DIALOG_COPY_WORKBOOK');

export type OpenDialogCopyWorkbookArgs = {
    id: typeof DIALOG_COPY_WORKBOOK;
    props: Props;
};

export const CopyWorkbookDialog: React.FC<Props> = ({
    open,
    workbookId,
    workbookTitle,
    initialCollectionId = null,
    onApply,
    onClose,
}) => {
    const dispatch = useDispatch<CollectionsStructureDispatch>();

    const copyIsLoading = useSelector(selectCopyWorkbookIsLoading);

    const handleCopyWorkbook = React.useCallback(
        async ({
            targetCollectionId,
            targetTitle,
        }: {
            targetCollectionId: string | null;
            targetWorkbookId: WorkbookId;
            targetTitle?: string;
        }) => {
            const result = await dispatch(
                copyWorkbook({
                    workbookId,
                    collectionId: targetCollectionId,
                    title: targetTitle ?? workbookTitle,
                }),
            );
            onApply(result?.workbookId);
        },
        [workbookId, workbookTitle, onApply, dispatch],
    );

    return (
        <CollectionStructureDialog
            open={open}
            type={ResourceType.Workbook}
            initialCollectionId={initialCollectionId}
            defaultTitle={workbookTitle}
            caption={i18n('label_copy')}
            textButtonApply={i18n('action_copy')}
            operationDeniedMessage={i18n('label_copy-denied-title')}
            applyIsLoading={copyIsLoading}
            workbookSelectionMode={false}
            onApply={handleCopyWorkbook}
            onClose={onClose}
        />
    );
};

DialogManager.registerDialog(DIALOG_COPY_WORKBOOK, CopyWorkbookDialog);
