import React from 'react';

import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {ErrorCode} from 'shared/constants';
import type {UpdateCollectionResponse} from 'shared/schema';
import type {AppDispatch} from 'store';

import DialogManager from '../../components/DialogManager/DialogManager';
import {updateCollection} from '../../store/actions/collectionsStructure';
import {selectUpdateCollectionIsLoading} from '../../store/selectors/collectionsStructure';

import {CollectionDialog, type CollectionDialogValues} from './CollectionDialog';
import {useCollectionEntityDialogState} from './hooks/useCollectionEntityDialogState';

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
    const {title, description, open, onClose} = props;

    const {
        values: dialogValues,
        errors: dialogErrors,
        handleChange: handleDialogChange,
        handleError: handleDialogError,
    } = useCollectionEntityDialogState({
        title,
        description,
    });

    const handleApply = React.useCallback(
        async (
            {title: dialogTitle, description: dialogDescription}: CollectionDialogValues,
            dialogOnClose,
        ) => {
            const {collectionId, onApply} = props;

            try {
                const result = await dispatch(
                    updateCollection(
                        {
                            collectionId,
                            title: dialogTitle,
                            description: dialogDescription,
                        },
                        true,
                    ),
                );

                if (onApply) {
                    onApply(result);
                }

                dialogOnClose();

                return result;
            } catch (error) {
                if (error.code === ErrorCode.CollectionAlreadyExists) {
                    handleDialogError({title: i18n('label_collection-already-exists-error')});
                }

                return Promise.resolve();
            }
        },
        [dispatch, handleDialogError, props],
    );

    const isLoading = useSelector(selectUpdateCollectionIsLoading);

    return (
        <CollectionDialog
            title={i18n('action_edit-collection')}
            values={dialogValues}
            errors={dialogErrors}
            textButtonApply={i18n('action_save')}
            open={open}
            titleAutoFocus
            isLoading={isLoading}
            onChange={handleDialogChange}
            onApply={handleApply}
            onClose={onClose}
        />
    );
};

DialogManager.registerDialog(DIALOG_EDIT_COLLECTION, EditCollectionDialog);
