import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useDispatch} from 'react-redux';

import DialogManager from '../../../../../components/DialogManager/DialogManager';
import {closeDialog} from '../../../../../store/actions/dialog';

import {QueryEditor} from './QueryEditor/QueryEditor';

import './DialogEditQuery.scss';

export const DIALOG_EDIT_QUERY = Symbol('DIALOG_EDIT_QUERY');

export type OpenDialogEditQueryArgs = {
    id: typeof DIALOG_EDIT_QUERY;
    props: undefined;
};

const i18nConnectionBasedControlFake = (str: string) => str;

const b = block('dialog-edit-query');

const DialogEditQuery: React.FC = () => {
    const dispatch = useDispatch();

    const [query, setQuery] = React.useState<string | undefined>();

    const handleClose = React.useCallback(() => dispatch(closeDialog()), []);
    const handleQueryEditorUpdate = (v: string) => setQuery(v);
    return (
        <Dialog className={b()} open={true} hasCloseButton={true} onClose={handleClose}>
            <Dialog.Header caption={i18nConnectionBasedControlFake('title_edit-query')} />
            <Dialog.Body>
                <QueryEditor query={query} onQueryEditorUpdate={handleQueryEditorUpdate} />
            </Dialog.Body>
            <Dialog.Footer
                preset="default"
                showError={false}
                listenKeyEnter={false}
                onClickButtonCancel={handleClose}
                textButtonApply={i18nConnectionBasedControlFake('button_apply')}
                textButtonCancel={i18nConnectionBasedControlFake('button_cancel')}
            />
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_EDIT_QUERY, DialogEditQuery);
