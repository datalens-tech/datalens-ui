import React from 'react';

import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {ErrorCode} from 'shared/constants';
import type {CreateCollectionResponse} from 'shared/schema';
import type {AppDispatch} from 'store';

import DialogManager from '../../components/DialogManager/DialogManager';
import {createCollection} from '../../store/actions/collectionsStructure';
import {selectCreateCollectionIsLoading} from '../../store/selectors/collectionsStructure';

import {CollectionDialog, type CollectionDialogValues} from './CollectionDialog';
import {useCollectionEntityDialogState} from './hooks/useCollectionEntityDialogState';

const i18n = I18n.keyset('component.collections-structure');

export const DIALOG_CREATE_COLLECTION = Symbol('DIALOG_CREATE_COLLECTION');

export type OpenDialogCreateCollectionArgs = {
    id: typeof DIALOG_CREATE_COLLECTION;
    props: Props;
};

type Props = {
    parentId: string | null;
    open: boolean;
    onClose: () => void;
    onApply?: (result: CreateCollectionResponse | null) => void;
};

export const CreateCollectionDialog: React.FC<Props> = (props) => {
    const dispatch: AppDispatch = useDispatch();
    const {open, onClose} = props;
    const {
        values: dialogValues,
        errors: dialogErrors,
        handleChange: handleDialogChange,
        handleError: handleDialogError,
    } = useCollectionEntityDialogState({
        title: '',
        description: '',
    });

    const handleApply = async (
        {title, description}: CollectionDialogValues,
        dialogOnClose: () => void,
    ) => {
        const {parentId, onApply} = props;

        try {
            const result = await dispatch(
                createCollection(
                    {
                        title,
                        description,
                        parentId,
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
    };

    const isLoading = useSelector(selectCreateCollectionIsLoading);

    return (
        <CollectionDialog
            values={dialogValues}
            errors={dialogErrors}
            title={i18n('action_create-collection')}
            textButtonApply={i18n('action_create')}
            open={open}
            isLoading={isLoading}
            onChange={handleDialogChange}
            onApply={handleApply}
            onClose={onClose}
            titleAutoFocus
        />
    );
};

DialogManager.registerDialog(DIALOG_CREATE_COLLECTION, CreateCollectionDialog);
