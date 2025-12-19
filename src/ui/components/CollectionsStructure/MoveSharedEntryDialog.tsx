import React from 'react';

import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';

import DialogManager from '../../components/DialogManager/DialogManager';
import type {CollectionsStructureDispatch} from '../../store/actions/collectionsStructure';
import {moveSharedEntry} from '../../store/actions/collectionsStructure';
import {selectMoveIsLoading} from '../../store/selectors/collectionsStructure';

import {CollectionStructureDialog, ResourceType} from './CollectionStructureDialog';

const i18n = I18n.keyset('component.collections-structure');

export type Props = {
    open: boolean;
    entryId: string;
    entryTitle: string;
    initialParentId?: string | null;
    onApply: () => void;
    onClose: (structureChanged: boolean) => void;
};

export const DIALOG_MOVE_SHARED_ENTRY = Symbol('DIALOG_MOVE_SHARED_ENTRY');

export type OpenDialogMoveSharedEntryArgs = {
    id: typeof DIALOG_MOVE_SHARED_ENTRY;
    props: Props;
};

export const MoveSharedEntryDialog: React.FC<Props> = ({
    open,
    entryId,
    entryTitle,
    initialParentId = null,
    onApply,
    onClose,
}) => {
    const dispatch = useDispatch<CollectionsStructureDispatch>();

    const moveIsLoading = useSelector(selectMoveIsLoading);

    const handleMoveSharedEntry = React.useCallback(
        async ({
            targetCollectionId,
            targetTitle,
        }: {
            targetCollectionId: string | null;
            targetTitle?: string;
        }) => {
            if (targetCollectionId) {
                await dispatch(
                    moveSharedEntry({
                        entryId,
                        collectionId: targetCollectionId,
                        name: targetTitle ?? entryTitle,
                    }),
                );
            }
            onApply();
        },
        [entryId, entryTitle, onApply, dispatch],
    );

    return (
        <CollectionStructureDialog
            open={open}
            type={ResourceType.Collection}
            initialCollectionId={initialParentId}
            defaultTitle={entryTitle}
            canSelectInitialCollectionId={false}
            caption={i18n('label_move')}
            textButtonApply={i18n('action_move')}
            operationDeniedMessage={i18n('label_move-denied-title')}
            applyIsLoading={moveIsLoading}
            workbookSelectionMode={false}
            onApply={handleMoveSharedEntry}
            onClose={onClose}
        />
    );
};

DialogManager.registerDialog(DIALOG_MOVE_SHARED_ENTRY, MoveSharedEntryDialog);
