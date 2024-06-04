import React from 'react';

import type {ButtonProps} from '@gravity-ui/uikit';
import {Dialog as CommonDialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {BackButton} from 'ui/units/dash/components/BackButton/BackButton';

import './Dialog.scss';

const b = block('sub-dialog-control');

interface DialogProps {
    visible: boolean;
    caption: string;
    onClose: () => void;
    onApply: () => void;
    disabled?: boolean;
}

const Dialog: React.FunctionComponent<DialogProps> = ({
    visible,
    caption,
    disabled,
    onApply,
    onClose,
    children,
}) => {
    return (
        <CommonDialog open={visible} onClose={onClose}>
            <div className={b()}>
                <CommonDialog.Header
                    caption={caption}
                    insertBefore={<BackButton onClose={onClose} />}
                />
                <CommonDialog.Body>
                    {/* the class is not specifically placed in props in the Body, so that there is a correct scroll*/}
                    <div className={b('body')}>{visible ? children : null}</div>
                </CommonDialog.Body>
                <CommonDialog.Footer
                    onClickButtonCancel={onClose}
                    onClickButtonApply={onApply}
                    textButtonApply={i18n('dash.control-dialog.edit', 'button_apply')}
                    textButtonCancel={i18n('dash.control-dialog.edit', 'button_cancel')}
                    propsButtonApply={{disabled, qa: 'dialog-apply-button'} as ButtonProps}
                    propsButtonCancel={{qa: 'dialog-cancel-button'}}
                />
            </div>
        </CommonDialog>
    );
};

export default Dialog;
