import React from 'react';

import {Dialog, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';

import DialogManager from '../../../../components/DialogManager/DialogManager';
import type {AppDispatch} from '../../../../store';
import {renameEntry} from '../../store/actions';
import {selectRenameEntryIsLoading} from '../../store/selectors';
import type {WorkbookEntry} from '../../types';

import './RenameEntryDialog.scss';

const b = block('dl-workbook-rename-entry-dialog');

const i18n = I18n.keyset('new-workbooks');

export type Props = {
    open: boolean;
    data: WorkbookEntry;
    onClose: () => void;
};

export const DIALOG_RENAME_ENTRY_IN_NEW_WORKBOOK = Symbol('DIALOG_RENAME_ENTRY_IN_NEW_WORKBOOK');

export type OpenDialogRenameEntryInNewWorkbookArgs = {
    id: typeof DIALOG_RENAME_ENTRY_IN_NEW_WORKBOOK;
    props: Props;
};

const RenameEntryDialog = React.memo<Props>(({open, data, onClose}) => {
    const dispatch: AppDispatch = useDispatch();
    const isLoading = useSelector(selectRenameEntryIsLoading);

    const [newNameValue, setNewNameValue] = React.useState(data.name);
    const textInputControlRef = React.useRef<HTMLInputElement>(null);

    const handleApply = React.useCallback(() => {
        dispatch(
            renameEntry({
                entryId: data.entryId,
                name: newNameValue,
                updateInline: true,
            }),
        ).then(() => {
            onClose();
        });
    }, [data.entryId, dispatch, newNameValue, onClose]);

    const propsButtonApply = React.useMemo(() => {
        return {
            disabled: !newNameValue || newNameValue === data.name,
        };
    }, [data.name, newNameValue]);

    return (
        <Dialog
            size="s"
            open={open}
            onClose={onClose}
            onEnterKeyDown={handleApply}
            initialFocus={textInputControlRef}
        >
            <Dialog.Header caption={i18n('label_rename-entry')} />
            <Dialog.Body>
                <div className={b('label')}>{i18n('label_title')}</div>
                <TextInput
                    value={newNameValue}
                    controlRef={textInputControlRef}
                    onUpdate={setNewNameValue}
                />
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonCancel={onClose}
                onClickButtonApply={handleApply}
                textButtonApply={i18n('action_rename')}
                textButtonCancel={i18n('action_cancel')}
                loading={isLoading}
                propsButtonApply={propsButtonApply}
            />
        </Dialog>
    );
});

RenameEntryDialog.displayName = 'RenameEntryDialog';

DialogManager.registerDialog(DIALOG_RENAME_ENTRY_IN_NEW_WORKBOOK, RenameEntryDialog);
