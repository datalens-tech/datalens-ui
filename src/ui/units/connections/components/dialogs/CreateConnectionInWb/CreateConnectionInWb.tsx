import React from 'react';

import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';

import DialogManager from '../../../../../components/DialogManager/DialogManager';
import type {DialogCreateWorkbookEntryProps} from '../../../../../components/EntryDialogues';
import {DialogCreateWorkbookEntry} from '../../../../../components/EntryDialogues';
import {closeDialog} from '../../../../../store/actions/dialog';

const i18n = I18n.keyset('connections.form');

export const DIALOG_CONN_CREATE_IN_WB_CONNECTION = Symbol('DIALOG_CONN_CREATE_IN_WB_CONNECTION');

export type DialogCreateConnectionInWbProps = {
    onApply: DialogCreateWorkbookEntryProps['onApply'];
    workbookId?: string;
};

export type OpenDialogCreateConnectionInWbArgs = {
    id: typeof DIALOG_CONN_CREATE_IN_WB_CONNECTION;
    props: DialogCreateConnectionInWbProps;
};

const DialogCreateConnection = ({workbookId, onApply}: DialogCreateConnectionInWbProps) => {
    const dispatch = useDispatch();

    const closeHandler = () => dispatch(closeDialog());

    return (
        <DialogCreateWorkbookEntry
            name={i18n('section_creation-connection')}
            defaultName={i18n('section_creation-connection')}
            caption={i18n('button_create-connection')}
            placeholder={i18n('field_connection-title')}
            textButtonApply={i18n('button_create')}
            textButtonCancel={i18n('button_cancel')}
            workbookId={workbookId}
            visible={true}
            onApply={onApply}
            onClose={closeHandler}
            onSuccess={closeHandler}
        />
    );
};

DialogManager.registerDialog(DIALOG_CONN_CREATE_IN_WB_CONNECTION, DialogCreateConnection);
