import React from 'react';

import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {CreateCollectionResponse} from 'shared/schema';
import type {AppDispatch} from 'store';

import DialogManager from '../../components/DialogManager/DialogManager';
import {createCollection} from '../../store/actions/collectionsStructure';
import {selectCreateCollectionIsLoading} from '../../store/selectors/collectionsStructure';

import {CollectionDialog} from './CollectionDialog';

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

    const handleApply = async ({title, project, description}: {title: string; project?: string; description: string}) => {
        const {parentId, onApply} = props;

        const result = await dispatch(
            createCollection({
                title,
                project,
                description,
                parentId,
            }),
        );

        if (onApply) {
            onApply(result);
        }

        return result;
    };

    const isLoading = useSelector(selectCreateCollectionIsLoading);

    return (
        <CollectionDialog
            title={i18n('action_create-collection')}
            textButtonApply={i18n('action_create')}
            open={open}
            isLoading={isLoading}
            onApply={handleApply}
            onClose={onClose}
            titleAutoFocus
        />
    );
};

DialogManager.registerDialog(DIALOG_CREATE_COLLECTION, CreateCollectionDialog);
