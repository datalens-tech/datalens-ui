import React from 'react';

import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';

import {AppDispatch} from '../../../../store';
import {DeleteDialog} from '../../components/DeleteDialog/DeleteDialog';
import {deleteCollection} from '../../store/actions';
import {selectDeleteCollectionIsLoading} from '../../store/selectors';

const i18n = I18n.keyset('collections');

type Props = {
    collectionId: string;
    open: boolean;
    deleteInItems?: boolean;
    onClose: () => void;
    onSuccessApply?: () => Promise<unknown>;
};

export const DeleteCollectionDialog: React.FC<Props> = ({
    collectionId,
    open,
    deleteInItems,
    onClose,
    onSuccessApply,
}) => {
    const dispatch: AppDispatch = useDispatch();
    const isLoading = useSelector(selectDeleteCollectionIsLoading);

    const onApply = React.useCallback(async () => {
        const result = await dispatch(
            deleteCollection({
                collectionId,
                deleteInItems,
            }),
        );

        if (onSuccessApply) {
            await onSuccessApply();
        }

        return result;
    }, [collectionId, deleteInItems, dispatch, onSuccessApply]);

    return (
        <DeleteDialog
            open={open}
            title={i18n('label_delete-collection')}
            description={i18n('section_delete-collection')}
            textButtonApply={i18n('action_delete')}
            isLoading={isLoading}
            onApply={onApply}
            onClose={onClose}
        />
    );
};
