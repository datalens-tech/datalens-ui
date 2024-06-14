import React from 'react';

import {I18n} from 'i18n';
import {useSelector} from 'react-redux';

// import type {CollectionsStructureDispatch} from '../../store/actions/collectionsStructure';
// import {moveCollections, moveWorkbooks} from '../../store/actions/collectionsStructure';
import {selectMoveIsLoading} from '../../store/selectors/collectionsStructure';
import DialogManager from '../DialogManager/DialogManager';

// import {CollectionStructureDialog, ResourceType} from './CollectionStructureDialog';
import {DeleteDialog} from './DeleteDialog';

const i18n = I18n.keyset('component.collections-structure');

export type Props = {
    open: boolean;
    collectionIds?: string[];
    workbookIds?: string[];
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
    onApply,
    onClose,
}) => {
    // const dispatch = useDispatch<CollectionsStructureDispatch>();

    const deleteIsLoading = useSelector(selectMoveIsLoading);

    const handleDelete = React.useCallback(async () => {
        const moveCollectionsPromise: Promise<unknown> = Promise.resolve();
        const moveWorkbooksPromise: Promise<unknown> = Promise.resolve();

        if (collectionIds?.length) {
            // moveCollectionsPromise = dispatch(
            //     moveCollections({
            //         collectionIds,
            //         parentId: targetCollectionId,
            //     }),
            // );
        }

        if (workbookIds?.length) {
            // moveWorkbooksPromise = dispatch(
            //     moveWorkbooks({
            //         workbookIds,
            //         collectionId: targetCollectionId,
            //     }),
            // );
        }

        await Promise.all([moveCollectionsPromise, moveWorkbooksPromise]);

        onApply();
    }, [collectionIds, workbookIds, onApply]);

    return (
        <DeleteDialog
            open={open}
            title={i18n('label_delete-collection')}
            // description={i18n('section_delete-collection', {
            //     name: collectionTitle,
            // })}
            textButtonApply={i18n('action_delete')}
            isLoading={deleteIsLoading}
            onApply={handleDelete}
            onClose={onClose}
        />
    );
};

DialogManager.registerDialog(DIALOG_DELETE_COLLECTIONS_WORKBOOKS, DeleteCollectionsWorkbooksDialog);
