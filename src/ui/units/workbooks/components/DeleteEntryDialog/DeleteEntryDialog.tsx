import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';

import DialogManager from '../../../../components/DialogManager/DialogManager';
import type {AppDispatch} from '../../../../store';
import {deleteEntry} from '../../store/actions';
import {selectDeleteEntryIsLoading} from '../../store/selectors';
import type {WorkbookEntry} from '../../types';

const i18n = I18n.keyset('new-workbooks');

export type Props = {
    open: boolean;
    data: WorkbookEntry;
    onClose: () => void;
};

export const DIALOG_DELETE_ENTRY_IN_NEW_WORKBOOK = Symbol('DIALOG_DELETE_ENTRY_IN_NEW_WORKBOOK');

export type OpenDialogDeleteEntryInNewWorkbookArgs = {
    id: typeof DIALOG_DELETE_ENTRY_IN_NEW_WORKBOOK;
    props: Props;
};

const DeleteEntryDialog = React.memo<Props>(({open, data, onClose}) => {
    const dispatch: AppDispatch = useDispatch();
    const isLoading = useSelector(selectDeleteEntryIsLoading);

    const handleApply = React.useCallback(() => {
        dispatch(
            deleteEntry({
                entryId: data.entryId,
                scope: data.scope,
                deleteInline: true,
            }),
        ).then(() => {
            onClose();
        });
    }, [data.entryId, data.scope, dispatch, onClose]);

    return (
        <Dialog size="s" open={open} onClose={onClose} onEnterKeyDown={handleApply}>
            <Dialog.Header caption={i18n('label_delete-entry')} />
            <Dialog.Body>{i18n('section_delete-entry', {entryName: data.name})}</Dialog.Body>
            <Dialog.Footer
                onClickButtonCancel={onClose}
                onClickButtonApply={handleApply}
                textButtonApply={i18n('action_delete')}
                textButtonCancel={i18n('action_cancel')}
                loading={isLoading}
            />
        </Dialog>
    );
});

DeleteEntryDialog.displayName = 'DeleteEntryDialog';

DialogManager.registerDialog(DIALOG_DELETE_ENTRY_IN_NEW_WORKBOOK, DeleteEntryDialog);
