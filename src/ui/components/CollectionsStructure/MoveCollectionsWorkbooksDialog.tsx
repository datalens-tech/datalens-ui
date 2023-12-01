import React from 'react';

import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';

import {
    CollectionsStructureDispatch,
    moveCollection,
} from '../../store/actions/collectionsStructure';
import {selectMoveIsLoading} from '../../store/selectors/collectionsStructure';
import DialogManager from '../DialogManager/DialogManager';

import {CollectionStructureDialog, ResourceType} from './CollectionStructureDialog';

const i18n = I18n.keyset('component.collections-structure');

export type Props = {
    open: boolean;
    collectionId: string;
    collectionTitle: string;
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
    collectionId,
    collectionTitle,
    initialParentId = null,
    onApply,
    onClose,
}) => {
    const dispatch = useDispatch<CollectionsStructureDispatch>();

    const moveIsLoading = useSelector(selectMoveIsLoading);

    const onApplys = React.useCallback(
        async ({
            targetCollectionId,
            targetTitle,
        }: {
            targetCollectionId: string | null;
            targetWorkbookId: string | null;
            targetTitle?: string;
        }) => {
            await dispatch(
                moveCollection({
                    collectionId,
                    parentId: targetCollectionId,
                    title: targetTitle ?? collectionTitle,
                }),
            );
            onApply();
        },
        [collectionId, collectionTitle, onApply, dispatch],
    );

    return (
        <CollectionStructureDialog
            open={open}
            type={ResourceType.Collection}
            initialCollectionId={initialParentId}
            defaultTitle={collectionTitle}
            canSelectInitialCollectionId={false}
            caption={i18n('label_move')}
            textButtonApply={i18n('action_move')}
            operationDeniedMessage={i18n('label_move-denied-title')}
            applyIsLoading={moveIsLoading}
            workbookSelectionMode={false}
            onApply={onApplys}
            onClose={onClose}
        />
    );
};

DialogManager.registerDialog(DIALOG_MOVE_COLLECTIONS_WORKBOOKS, MoveCollectionsWorkbooksDialog);
