import React from 'react';

import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {DL, URL_QUERY} from 'ui';

import DialogManager from '../../../../../components/DialogManager/DialogManager';
import type {EntryDialogBaseProps} from '../../../../../components/EntryDialogues';
import {EntryDialogBase} from '../../../../../components/EntryDialogues';
import {closeDialog} from '../../../../../store/actions/dialog';
import {getQueryParam} from '../../../utils';

const i18n = I18n.keyset('connections.form');

export const DIALOG_CONN_CREATE_CONNECTION = Symbol('DIALOG_CONN_CREATE_CONNECTION');

export type DialogCreateConnectionProps = {
    onApply: EntryDialogBaseProps<void>['onApply'];
};

export type OpenDialogCreateConnectionArgs = {
    id: typeof DIALOG_CONN_CREATE_CONNECTION;
    props: DialogCreateConnectionProps;
};

const getInitialPath = () => getQueryParam(URL_QUERY.CURRENT_PATH) || DL.USER_FOLDER;

const DialogCreateConnection = ({onApply}: DialogCreateConnectionProps) => {
    const dispatch = useDispatch();

    const closeHandler = () => dispatch(closeDialog());

    return (
        <EntryDialogBase
            name={i18n('section_creation-connection')}
            defaultName={i18n('section_creation-connection')}
            path={getInitialPath()}
            caption={i18n('button_create-connection')}
            placeholder={i18n('field_connection-title')}
            textButtonApply={i18n('button_create')}
            textButtonCancel={i18n('button_cancel')}
            visible={true}
            withInput={true}
            onError={() => null}
            onApply={onApply}
            onClose={closeHandler}
            onSuccess={closeHandler}
        />
    );
};

DialogManager.registerDialog(DIALOG_CONN_CREATE_CONNECTION, DialogCreateConnection);
