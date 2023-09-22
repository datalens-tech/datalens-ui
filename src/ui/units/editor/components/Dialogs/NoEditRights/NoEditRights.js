import React from 'react';

import {Button, Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import PropTypes from 'prop-types';

import {DIALOG_RESOLVE_STATUS} from '../../../constants/common';

import './NoEditRights.scss';

const b = block('dialog-no-edit-rights');
const i18n = I18n.keyset('editor.dialog-no-edit-rights.view');

function NoEditRights({visible, onClose, onAccessRights, onSaveAs}) {
    function onCloseDialog() {
        onClose({status: DIALOG_RESOLVE_STATUS.CLOSE});
    }

    return (
        <Dialog hasButtonClose open={visible} onClose={onCloseDialog} disableFocusTrap={true}>
            <div className={b()}>
                <Dialog.Header caption={i18n('section_no-rights-title')} />
                <Dialog.Body>
                    <div>{i18n('label_no-rights-text')}</div>
                </Dialog.Body>
                <Dialog.Footer preset="default" listenKeyEnter={true} hr={false}>
                    <Button
                        className={b('btn-access-rights')}
                        view="outlined"
                        size="l"
                        onClick={onAccessRights}
                    >
                        {i18n('button_access-rights')}
                    </Button>
                    <Button view="outlined" size="l" onClick={onSaveAs}>
                        {i18n('button_save-as')}
                    </Button>
                </Dialog.Footer>
            </div>
        </Dialog>
    );
}

NoEditRights.propTypes = {
    onClose: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired,

    onAccessRights: PropTypes.func.isRequired,
    onSaveAs: PropTypes.func.isRequired,
};

export default NoEditRights;
