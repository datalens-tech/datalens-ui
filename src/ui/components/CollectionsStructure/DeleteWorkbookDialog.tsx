import React from 'react';

import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';

import DialogManager from '../../components/DialogManager/DialogManager';
import type {AppDispatch} from '../../store';
import {deleteWorkbook} from '../../store/actions/collectionsStructure';
import {selectDeleteWorkbookIsLoading} from '../../store/selectors/collectionsStructure';

import {DeleteDialog} from './DeleteDialog';

const i18n = I18n.keyset('component.collections-structure');

type Props = {
    open: boolean;
    workbookId: string;
    workbookTitle: string;
    onClose: () => void;
    onSuccessApply?: (workbookId: string) => void;
};

export const DIALOG_DELETE_WORKBOOK = Symbol('DIALOG_DELETE_WORKBOOK');

export type OpenDialogDeleteWorkbookArgs = {
    id: typeof DIALOG_DELETE_WORKBOOK;
    props: Props;
};

export const DeleteWorkbookDialog: React.FC<Props> = ({
    open,
    workbookId,
    workbookTitle,
    onClose,
    onSuccessApply,
}) => {
    const dispatch: AppDispatch = useDispatch();
    const isLoading = useSelector(selectDeleteWorkbookIsLoading);

    const onApply = React.useCallback(async () => {
        const result = await dispatch(
            deleteWorkbook({
                workbookId,
            }),
        );

        if (onSuccessApply) {
            onSuccessApply(workbookId);
        }

        return result;
    }, [dispatch, onSuccessApply, workbookId]);

    return (
        <DeleteDialog
            title={i18n('label_delete-workbook')}
            description={i18n('section_delete-workbook', {
                name: workbookTitle,
            })}
            textButtonApply={i18n('action_delete')}
            open={open}
            isLoading={isLoading}
            onApply={onApply}
            onClose={onClose}
        />
    );
};

DialogManager.registerDialog(DIALOG_DELETE_WORKBOOK, DeleteWorkbookDialog);
