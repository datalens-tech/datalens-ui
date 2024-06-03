import React from 'react';

import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';

import type {CollectionsStructureDispatch} from '../../store/actions/collectionsStructure';
import {moveCollections, moveWorkbooks} from '../../store/actions/collectionsStructure';
import {selectMoveIsLoading} from '../../store/selectors/collectionsStructure';
import DialogManager from '../DialogManager/DialogManager';

import {CollectionStructureDialog, ResourceType} from './CollectionStructureDialog';

const i18n = I18n.keyset('component.collections-structure');

export type Props = {
    open: boolean;
    collectionIds?: string[];
    workbookIds?: string[];
    initialParentId?: string | null;
    onApply: () => void;
    onClose: (structureChanged: boolean) => void;
};

export const DIALOG_MOVE_COLLECTIONS_WORKBOOKS = Symbol('DIALOG_MOVE_COLLECTIONS_WORKBOOKS');

export type OpenDialogMoveCollectionsWorkbooksArgs = {
    id: typeof DIALOG_MOVE_COLLECTIONS_WORKBOOKS;
    props: Props;
};

export const MoveCollectionsWorkbooksDialog: React.FC<Props> = ({
    open,
    collectionIds,
    workbookIds,
    initialParentId = null,
    onApply,
    onClose,
}) => {
    const dispatch = useDispatch<CollectionsStructureDispatch>();

    const moveIsLoading = useSelector(selectMoveIsLoading);

    const handleMove = React.useCallback(
        async ({targetCollectionId}: {targetCollectionId: string | null}) => {
            let moveCollectionsPromise: Promise<unknown> = Promise.resolve();
            let moveWorkbooksPromise: Promise<unknown> = Promise.resolve();

            if (collectionIds?.length) {
                moveCollectionsPromise = dispatch(
                    moveCollections({
                        collectionIds,
                        parentId: targetCollectionId,
                    }),
                );
            }

            if (workbookIds?.length) {
                moveWorkbooksPromise = dispatch(
                    moveWorkbooks({
                        workbookIds,
                        collectionId: targetCollectionId,
                    }),
                );
            }

            await Promise.all([moveCollectionsPromise, moveWorkbooksPromise]);

            onApply();
        },
        [dispatch, collectionIds, workbookIds, onApply],
    );

    return (
        <CollectionStructureDialog
            open={open}
            type={ResourceType.Collection}
            initialCollectionId={initialParentId}
            canSelectInitialCollectionId={false}
            caption={i18n('label_move')}
            textButtonApply={i18n('action_move')}
            operationDeniedMessage={i18n('label_move-denied-title')}
            applyIsLoading={moveIsLoading}
            workbookSelectionMode={false}
            massMoveMode
            onApply={handleMove}
            onClose={onClose}
        />
    );
};

DialogManager.registerDialog(DIALOG_MOVE_COLLECTIONS_WORKBOOKS, MoveCollectionsWorkbooksDialog);
