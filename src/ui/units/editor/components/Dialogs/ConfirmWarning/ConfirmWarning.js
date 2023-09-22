import React from 'react';

import {TriangleExclamationFill} from '@gravity-ui/icons';
import {Button, Dialog, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import PropTypes from 'prop-types';

import {DIALOG_RESOLVE_STATUS} from '../../../constants/common';

import './ConfirmWarning.scss';

const b = block('dialog-confirm-warning');
const i18n = I18n.keyset('editor.dialog-confirm-warning.view');

function ConfirmWarning({visible, onClose, message}) {
    function onCloseDialog() {
        onClose({status: DIALOG_RESOLVE_STATUS.CLOSE});
    }
    function onApplyDialog() {
        onClose({status: DIALOG_RESOLVE_STATUS.SUCCESS});
    }

    return (
        <Dialog hasCloseButton={false} open={visible} onClose={onCloseDialog}>
            <Dialog.Body className={b()}>
                <div className={b('body')}>
                    <div>
                        <Icon
                            data={TriangleExclamationFill}
                            className={b('icon')}
                            width="24"
                            height="24"
                        />
                    </div>
                    <div className={b('message')}>{message}</div>
                </div>
            </Dialog.Body>
            <div className={b('footer')}>
                <div className={b('button', {action: 'cancel'})}>
                    <Button view="normal" width="max" size="l" onClick={() => onCloseDialog()}>
                        {i18n('button_cancel')}
                    </Button>
                </div>
                <div className={b('button', {action: 'apply'})}>
                    <Button view="action" width="max" size="l" onClick={() => onApplyDialog()}>
                        {i18n('button_apply')}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
}

ConfirmWarning.propTypes = {
    onClose: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired,

    message: PropTypes.string.isRequired,
};

export default ConfirmWarning;
