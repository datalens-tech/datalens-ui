import React from 'react';

import {Dialog as CommonDialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {DialogControlParamsQa} from 'shared/constants';
import {BackButton} from 'ui/components/ControlComponents/BackButton/BackButton';

import './Dialog.scss';

const b = block('sub-dialog-control');

interface DialogProps {
    visible: boolean;
    caption: string;
    onClose: () => void;
    onApply: () => void;
    disabled?: boolean;
    onTransitionEntered?: () => void;
}

const Dialog: React.FunctionComponent<DialogProps> = ({
    visible,
    caption,
    disabled,
    onApply,
    onClose,
    children,
    onTransitionEntered,
}) => {
    return (
        <CommonDialog open={visible} onClose={onClose} onTransitionEntered={onTransitionEntered}>
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
                    propsButtonApply={{disabled, qa: DialogControlParamsQa.buttonApply}}
                    propsButtonCancel={{qa: DialogControlParamsQa.buttonCancel}}
                />
            </div>
        </CommonDialog>
    );
};

export default Dialog;
