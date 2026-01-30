import React from 'react';

import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import DialogConfirm, {DialogConfirmApplyStatus} from 'ui/components/DialogConfirm/DialogConfirm';

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
                entry: data,
                deleteInline: true,
            }),
        ).then(() => {
            onClose();
        });
    }, [data.entryId, data.scope, dispatch, onClose]);

    return (
        <DialogConfirm
            visible={open}
            widthType="medium"
            confirmHeaderText={i18n('label_delete-entry')}
            message={i18n('section_delete-entry', {entryName: data.name})}
            onApply={handleApply}
            confirmButtonText={i18n('action_delete')}
            cancelButtonText={i18n('action_cancel')}
            applyBtnLoadingStatus={isLoading ? DialogConfirmApplyStatus.Loading : undefined}
            onCancel={onClose}
            confirmOnEnterPress={true}
            confirmButtonView="outlined-danger"
            isWarningConfirm={true}
            cancelButtonView="flat"
            showIcon={false}
        />
    );
});

DeleteEntryDialog.displayName = 'DeleteEntryDialog';

DialogManager.registerDialog(DIALOG_DELETE_ENTRY_IN_NEW_WORKBOOK, DeleteEntryDialog);
