import React from 'react';

import {TriangleExclamationFill} from '@gravity-ui/icons';
import {Alert, Button, ButtonView, Dialog, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import {withHiddenUnmount} from '../../hoc/withHiddenUnmount';
import DialogManager from '../DialogManager/DialogManager';

import './DialogConfirm.scss';

const b = block('dl-dialog-confirm');
const i18n = I18n.keyset('component.dl-dialog-confirm.view');

export interface DialogConfirmProps {
    onApply: (event?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
    onCancel: (event?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
    visible: boolean;
    message: React.ReactNode;
    cancelButtonText?: string;
    confirmButtonText?: string;
    confirmHeaderText?: string;
    isWarningConfirm?: boolean;
    hideIcon?: boolean;
    confirmOnEnterPress?: boolean;
    widthType?: 'medium'; // dialog width presets
    applyBtnLoadingStatus?: DialogConfirmApplyStatus;
    cancelButtonView?: ButtonView;
    confirmButtonView?: ButtonView;
    showAlert?: boolean;
}

export enum DialogConfirmApplyStatus {
    Loading = 'loading',
    Successed = 'successed',
    Failed = 'failed',
}

export const DIALOG_CONFIRM = Symbol('DIALOG_CONFIRM');
export type OpenDialogConfirmArgs = {
    id: typeof DIALOG_CONFIRM;
    props: DialogConfirmProps;
};

const DialogConfirm: React.FC<DialogConfirmProps> = (props) => {
    const {
        message,
        cancelButtonText,
        confirmButtonText,
        confirmOnEnterPress,
        visible,
        onApply,
        onCancel,
        isWarningConfirm,
        confirmHeaderText,
        widthType,
        applyBtnLoadingStatus,
        hideIcon,
        cancelButtonView = 'normal',
        confirmButtonView = 'action',
        showAlert,
    } = props;

    const enterPressHandler = React.useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                onApply();
            }
        },
        [onApply],
    );

    React.useEffect(() => {
        if (confirmOnEnterPress && visible) {
            document.addEventListener('keydown', enterPressHandler);
        }

        return () => {
            if (confirmOnEnterPress) {
                document.removeEventListener('keydown', enterPressHandler);
            }
        };
    }, [confirmOnEnterPress, visible, enterPressHandler]);

    const buttonWidth = isWarningConfirm ? 'auto' : 'max';

    return (
        <Dialog
            open={visible}
            onClose={() => onCancel()}
            hasCloseButton={Boolean(confirmHeaderText)}
            className={b({warning: isWarningConfirm, [widthType as string]: Boolean(widthType)})}
            qa="dialog-confirm"
        >
            {confirmHeaderText && (
                <Dialog.Header
                    className={b('header', {warning: isWarningConfirm})}
                    caption={confirmHeaderText}
                />
            )}
            <Dialog.Body className={b('body-container', {warning: isWarningConfirm})}>
                {showAlert ? (
                    <Alert theme="warning" message={message} view="outlined" />
                ) : (
                    <div className={b('body', {warning: isWarningConfirm})}>
                        {hideIcon ? null : (
                            <div className={b('icon', {warning: isWarningConfirm})}>
                                <Icon data={TriangleExclamationFill} size={32} />
                            </div>
                        )}
                        <div
                            className={b('message', {
                                warning: isWarningConfirm,
                                'hide-icon': hideIcon,
                            })}
                        >
                            {message}
                        </div>
                    </div>
                )}
            </Dialog.Body>
            <div className={b('footer', {warning: isWarningConfirm})}>
                <div className={b('button', {action: 'cancel', warning: isWarningConfirm})}>
                    <Button view={cancelButtonView} width={buttonWidth} size="l" onClick={onCancel}>
                        {cancelButtonText || i18n('button_cancel')}
                    </Button>
                </div>
                <div className={b('button', {action: 'apply', warning: isWarningConfirm})}>
                    <Button
                        width={buttonWidth}
                        size="l"
                        view={confirmButtonView}
                        onClick={onApply}
                        qa="dialog-confirm-apply-button"
                        loading={applyBtnLoadingStatus === DialogConfirmApplyStatus.Loading}
                    >
                        {confirmButtonText || i18n('button_apply')}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_CONFIRM, withHiddenUnmount(DialogConfirm));
export default withHiddenUnmount(DialogConfirm);
