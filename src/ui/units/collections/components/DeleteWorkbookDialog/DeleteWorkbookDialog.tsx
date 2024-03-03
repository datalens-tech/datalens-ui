import React from 'react';

import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';

import {AppDispatch} from '../../../../store';
import {deleteWorkbook} from '../../store/actions';
import {selectDeleteWorkbookIsLoading} from '../../store/selectors';
import {DeleteDialog} from '../DeleteDialog/DeleteDialog';

const i18n = I18n.keyset('collections');

type Props = {
    workbookId: string;
    workbookTitle: string;
    open: boolean;
    deleteInItems?: boolean;
    onClose: () => void;
    onSuccessApply?: () => Promise<unknown>;
};

export const DeleteWorkbookDialog: React.FC<Props> = ({
    workbookId,
    workbookTitle,
    open,
    deleteInItems,
    onClose,
    onSuccessApply,
}) => {
    const dispatch: AppDispatch = useDispatch();
    const isLoading = useSelector(selectDeleteWorkbookIsLoading);

    const onApply = React.useCallback(async () => {
        const result = await dispatch(
            deleteWorkbook({
                workbookId,
                deleteInItems,
            }),
        );

        if (onSuccessApply) {
            await onSuccessApply();
        }

        return result;
    }, [deleteInItems, dispatch, onSuccessApply, workbookId]);

    return (
        <DeleteDialog
            title={i18n('label_delete-workbook')}
            description={i18n('section_delete-workbook', {
                workbook: workbookTitle,
            })}
            textButtonApply={i18n('action_delete')}
            open={open}
            isLoading={isLoading}
            onApply={onApply}
            onClose={onClose}
        />
    );
};
