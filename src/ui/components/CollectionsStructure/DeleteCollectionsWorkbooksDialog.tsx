import React from 'react';

import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {CollectionsStructureDispatch} from 'ui/store/actions/collectionsStructure';
import {deleteCollections, deleteWorkbooks} from 'ui/store/actions/collectionsStructure';

import {selectDeleteIsLoading} from '../../store/selectors/collectionsStructure';
import DialogManager from '../DialogManager/DialogManager';

import {DeleteCollectionsWorkbooksContent} from './DeleteCollectionsWorkbooksContent';
import {DeleteDialog} from './DeleteDialog';

const i18n = I18n.keyset('component.collections-structure');

export type Props = {
    open: boolean;
    collectionIds: string[];
    workbookIds: string[];
    collectionTitles: string[];
    workbookTitles: string[];
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
    const deleteIsLoading = useSelector(selectDeleteIsLoading);
    const dispatch = useDispatch<CollectionsStructureDispatch>();

    const handleDelete = React.useCallback(async () => {
        let deleteCollectionsPromise: Promise<unknown> = Promise.resolve();
        let deleteWorkbooksPromise: Promise<unknown> = Promise.resolve();

        if (collectionIds?.length) {
            deleteCollectionsPromise = dispatch(
                deleteCollections({
                    collectionIds,
                }),
            );
        }

        if (workbookIds?.length) {
            deleteWorkbooksPromise = dispatch(
                deleteWorkbooks({
                    workbookIds,
                }),
            );
        }

        await Promise.all([deleteCollectionsPromise, deleteWorkbooksPromise]).then((response) => {
            if (response.filter((res) => res).length) {
                onApply();
            }
        });
    }, [collectionIds, dispatch, onApply, workbookIds]);

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
