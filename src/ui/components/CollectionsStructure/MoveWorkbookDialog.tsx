import React from 'react';

import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {WorkbookId} from 'shared';

import DialogManager from '../../components/DialogManager/DialogManager';
import type {CollectionsStructureDispatch} from '../../store/actions/collectionsStructure';
import {moveWorkbook} from '../../store/actions/collectionsStructure';
import {selectMoveIsLoading} from '../../store/selectors/collectionsStructure';

import {CollectionStructureDialog, ResourceType} from './CollectionStructureDialog';

const i18n = I18n.keyset('component.collections-structure');

export type Props = {
    open: boolean;
    workbookId: string;
    workbookTitle: string;
    initialCollectionId?: string | null;
    onApply: () => void;
    onClose: (structureChanged: boolean) => void;
};

export const DIALOG_MOVE_WORKBOOK = Symbol('DIALOG_MOVE_WORKBOOK');

export type OpenDialogMoveWorkbookArgs = {
    id: typeof DIALOG_MOVE_WORKBOOK;
    props: Props;
};

export const MoveWorkbookDialog: React.FC<Props> = ({
    open,
    workbookId,
    workbookTitle,
    initialCollectionId = null,
    onApply,
    onClose,
}) => {
    const dispatch = useDispatch<CollectionsStructureDispatch>();

    const moveIsLoading = useSelector(selectMoveIsLoading);

    const handleMoveWorkbook = React.useCallback(
        async ({
            targetCollectionId,
            targetTitle,
        }: {
            targetCollectionId: string | null;
            targetWorkbookId: WorkbookId;
            targetTitle?: string;
        }) => {
            await dispatch(
                moveWorkbook({
                    workbookId,
                    collectionId: targetCollectionId,
                    title: targetTitle ?? workbookTitle,
                }),
            );
            onApply();
        },
        [workbookId, workbookTitle, onApply, dispatch],
    );

    return (
        <CollectionStructureDialog
            open={open}
            type={ResourceType.Workbook}
            initialCollectionId={initialCollectionId}
            defaultTitle={workbookTitle}
            canSelectInitialCollectionId={false}
            caption={i18n('label_move')}
            textButtonApply={i18n('action_move')}
            operationDeniedMessage={i18n('label_move-denied-title')}
            applyIsLoading={moveIsLoading}
            workbookSelectionMode={false}
            onApply={handleMoveWorkbook}
            onClose={onClose}
        />
    );
};

DialogManager.registerDialog(DIALOG_MOVE_WORKBOOK, MoveWorkbookDialog);
