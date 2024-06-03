import React from 'react';

import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';

import DialogManager from '../../components/DialogManager/DialogManager';
import type {AppDispatch} from '../../store';
import {deleteCollection} from '../../store/actions/collectionsStructure';
import {selectDeleteCollectionIsLoading} from '../../store/selectors/collectionsStructure';

import {DeleteDialog} from './DeleteDialog';

const i18n = I18n.keyset('component.collections-structure');

type Props = {
    open: boolean;
    collectionId: string;
    collectionTitle: string;
    onClose: () => void;
    onSuccessApply?: (collectionId: string) => void;
};

export const DIALOG_DELETE_COLLECTION = Symbol('DIALOG_DELETE_COLLECTION');

export type OpenDialogDeleteCollectionArgs = {
    id: typeof DIALOG_DELETE_COLLECTION;
    props: Props;
};

export const DeleteCollectionDialog: React.FC<Props> = ({
    open,
    collectionId,
    collectionTitle,
    onClose,
    onSuccessApply,
}) => {
    const dispatch: AppDispatch = useDispatch();
    const isLoading = useSelector(selectDeleteCollectionIsLoading);

    const onApply = React.useCallback(async () => {
        const result = await dispatch(
            deleteCollection({
                collectionId,
            }),
        );

        if (onSuccessApply) {
            onSuccessApply(collectionId);
        }

        return result;
    }, [collectionId, dispatch, onSuccessApply]);

    return (
        <DeleteDialog
            open={open}
            title={i18n('label_delete-collection')}
            description={i18n('section_delete-collection', {
                name: collectionTitle,
            })}
            textButtonApply={i18n('action_delete')}
            isLoading={isLoading}
            onApply={onApply}
            onClose={onClose}
        />
    );
};

DialogManager.registerDialog(DIALOG_DELETE_COLLECTION, DeleteCollectionDialog);
