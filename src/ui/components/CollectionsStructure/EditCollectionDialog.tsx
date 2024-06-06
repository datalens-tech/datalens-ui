import React from 'react';

import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {UpdateCollectionResponse} from 'shared/schema';
import type {AppDispatch} from 'store';

import DialogManager from '../../components/DialogManager/DialogManager';
import {updateCollection} from '../../store/actions/collectionsStructure';
import {selectUpdateCollectionIsLoading} from '../../store/selectors/collectionsStructure';

import {CollectionDialog} from './CollectionDialog';

const i18n = I18n.keyset('component.collections-structure');

type Props = {
    collectionId: string;
    title: string;
    description: string;
    open: boolean;
    onClose: () => void;
    onApply?: (result: UpdateCollectionResponse | null) => void;
};

export const DIALOG_EDIT_COLLECTION = Symbol('DIALOG_EDIT_COLLECTION');

export type OpenDialogEditCollectionArgs = {
    id: typeof DIALOG_EDIT_COLLECTION;
    props: Props;
};

export const EditCollectionDialog: React.FC<Props> = (props) => {
    const dispatch: AppDispatch = useDispatch();

    const handleApply = React.useCallback(
        async ({title, description}: {title: string; description: string}) => {
            const {collectionId, onApply} = props;

            const result = await dispatch(
                updateCollection({
                    collectionId,
                    title,
                    description,
                }),
            );

            if (onApply) {
                onApply(result);
            }

            return result;
        },
        [dispatch, props],
    );

    const {title, description, open, onClose} = props;

    const isLoading = useSelector(selectUpdateCollectionIsLoading);

    return (
        <CollectionDialog
            title={i18n('action_edit-collection')}
            titleValue={title}
            descriptionValue={description}
            textButtonApply={i18n('action_save')}
            open={open}
            titleAutoFocus
            isLoading={isLoading}
            onApply={handleApply}
            onClose={onClose}
        />
    );
};

DialogManager.registerDialog(DIALOG_EDIT_COLLECTION, EditCollectionDialog);
