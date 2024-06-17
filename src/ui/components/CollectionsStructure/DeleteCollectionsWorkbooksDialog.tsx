import React from 'react';

import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
// import type {CollectionsStructureDispatch} from '../../store/actions/collectionsStructure';
// import {moveCollections, moveWorkbooks} from '../../store/actions/collectionsStructure';
import type {CollectionsStructureDispatch} from 'ui/store/actions/collectionsStructure';
import {deleteCollections} from 'ui/store/actions/collectionsStructure';

import {selectMoveIsLoading} from '../../store/selectors/collectionsStructure';
import DialogManager from '../DialogManager/DialogManager';

// import {CollectionStructureDialog, ResourceType} from './CollectionStructureDialog';
import {DeleteCollectionsWorkbooksContent} from './DeleteCollectionsWorkbooksContent';
import {DeleteDialog} from './DeleteDialog';

const i18n = I18n.keyset('component.collections-structure');

export type Props = {
    open: boolean;
    collectionIds: string[];
    workbookIds: string[];
    collectionTitles: string[];
    workbookTitles: string[];
    initialParentId?: string | null;
    onApply: () => void;
    onClose: () => void;
};

export const DIALOG_DELETE_COLLECTIONS_WORKBOOKS = Symbol('DIALOG_DELETE_COLLECTIONS_WORKBOOKS');

export type OpenDialogDeleteCollectionsWorkbooksArgs = {
    id: typeof DIALOG_DELETE_COLLECTIONS_WORKBOOKS;
    props: Props;
};

export const DeleteCollectionsWorkbooksDialog: React.FC<Props> = ({
    open,
    collectionIds,
    workbookIds,
    collectionTitles,
    workbookTitles,
    onApply,
    onClose,
}) => {
    const deleteIsLoading = useSelector(selectMoveIsLoading);
    const dispatch = useDispatch<CollectionsStructureDispatch>();

    const handleDelete = React.useCallback(async () => {
        let deleteCollectionsPromise: Promise<unknown> = Promise.resolve();
        const deleteWorkbooksPromise: Promise<unknown> = Promise.resolve();

        if (collectionIds?.length) {
            deleteCollectionsPromise = dispatch(
                deleteCollections({
                    collectionIds,
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

        await Promise.all([deleteCollectionsPromise, deleteWorkbooksPromise]);

        onApply();
    }, [collectionIds, onApply, workbookIds]);

    return (
        <DeleteDialog
            open={open}
            title={i18n('label_delete-collections-workbooks')}
            description={
                <DeleteCollectionsWorkbooksContent
                    collectionTitles={collectionTitles}
                    workbookTitles={workbookTitles}
                />
            }
            textButtonApply={i18n('action_delete')}
            isLoading={deleteIsLoading}
            onApply={handleDelete}
            onClose={onClose}
        />
    );
};

DialogManager.registerDialog(DIALOG_DELETE_COLLECTIONS_WORKBOOKS, DeleteCollectionsWorkbooksDialog);
