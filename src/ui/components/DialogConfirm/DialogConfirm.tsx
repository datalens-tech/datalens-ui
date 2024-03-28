import React from 'react';

import type {ButtonView} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {DialogConfirmQA} from 'shared/constants/qa';

import {withHiddenUnmount} from '../../hoc/withHiddenUnmount';
import DialogCommon from '../DialogCommon/DialogCommon';
import DialogManager from '../DialogManager/DialogManager';

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
    showIcon?: boolean;
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
        showIcon = true,
        cancelButtonView = 'normal',
        confirmButtonView = 'action',
        showAlert,
    } = props;

    return (
        <DialogCommon
            visible={visible}
            widthType={widthType}
            isWarning={isWarningConfirm}
            headerText={confirmHeaderText}
            closeOnEnterPress={confirmOnEnterPress}
            showIcon={showIcon}
            showAlert={showAlert}
            qa={DialogConfirmQA.Dialog}
            onClose={() => onCancel()}
            actions={[
                {
                    qa: DialogConfirmQA.CancelButton,
                    text: cancelButtonText || i18n('button_cancel'),
                    view: cancelButtonView,
                    onClick: onCancel,
                },
                {
                    qa: DialogConfirmQA.ApplyButton,
                    text: confirmButtonText || i18n('button_apply'),
                    view: confirmButtonView,
                    loading: applyBtnLoadingStatus === DialogConfirmApplyStatus.Loading,
                    onClick: onApply,
                },
            ]}
        >
            {message}
        </DialogCommon>
    );
};

DialogManager.registerDialog(DIALOG_CONFIRM, withHiddenUnmount(DialogConfirm));
export default withHiddenUnmount(DialogConfirm);
