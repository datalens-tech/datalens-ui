import React from 'react';

import {sdk} from 'ui';

import ConfirmWarning from './ConfirmWarning/ConfirmWarning';
import NoEditRights from './NoEditRights/NoEditRights';

const DIALOG = {
    CONFIRM_WARNING: 'confirm_warning',
    NO_EDIT_RIGHTS: 'no_edit_rights',
};

const dialogs = {
    [DIALOG.CONFIRM_WARNING]: ConfirmWarning,
    [DIALOG.NO_EDIT_RIGHTS]: NoEditRights,
};

const initState = {
    dialog: null,
    resolveOpenDialog: null,
    visible: false,
    dialogProps: null,
    updateKey: 0,
};

class Dialogs extends React.PureComponent {
    state = {...initState};

    static DIALOG = DIALOG;

    // public via ref
    open({dialog, dialogProps = {}}) {
        return new Promise((resolveOpenDialog) => {
            this.setState({
                dialog,
                resolveOpenDialog,
                dialogProps,
                visible: true,
                updateKey: this.state.updateKey + 1,
            });
        });
    }

    _onClose = ({status, data = {}}) => {
        const {resolveOpenDialog} = this.state;
        this.setState({...initState});
        resolveOpenDialog({status, data});
    };

    render() {
        const props = {
            ...this.state.dialogProps,
            sdk,
            visible: this.state.visible,
            onClose: this._onClose,
        };

        if (dialogs[this.state.dialog]) {
            return React.createElement(dialogs[this.state.dialog], {
                key: this.state.updateKey,
                ...props,
            });
        }

        return null;
    }
}

export default Dialogs;
