import React from 'react';

import type {ButtonView} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {DialogWarningQA} from 'shared/constants/qa';

import {withHiddenUnmount} from '../../hoc/withHiddenUnmount';
import DialogCommon from '../DialogCommon/DialogCommon';
import DialogManager from '../DialogManager/DialogManager';

const i18n = I18n.keyset('component.dl-dialog-warning.view');

export interface DialogWarningProps {
    onApply: (event?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
    visible: boolean;
    message: React.ReactNode;
    confirmButtonText?: string;
    confirmHeaderText?: string;
    isWarningConfirm?: boolean;
    showIcon?: boolean;
    confirmOnEnterPress?: boolean;
    widthType?: 'medium'; // dialog width presets
    applyBtnLoadingStatus?: DialogWarningApplyStatus;
    confirmButtonView?: ButtonView;
    showAlert?: boolean;
}

export enum DialogWarningApplyStatus {
    Loading = 'loading',
    Successed = 'successed',
    Failed = 'failed',
}

export const DIALOG_WARNING = Symbol('DIALOG_WARNING');
export type OpenDialogWarningArgs = {
    id: typeof DIALOG_WARNING;
    props: DialogWarningProps;
};

const DialogWarning: React.FC<DialogWarningProps> = (props) => {
    const {
        message,
        confirmButtonText,
        confirmOnEnterPress,
        visible,
        onApply,
        isWarningConfirm,
        confirmHeaderText,
        widthType,
        applyBtnLoadingStatus,
        showIcon = true,
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
            qa={DialogWarningQA.Dialog}
            onClose={() => onApply()}
            actions={[
                {
                    qa: DialogWarningQA.ApplyButton,
                    text: confirmButtonText || i18n('button_apply'),
                    view: confirmButtonView,
                    loading: applyBtnLoadingStatus === DialogWarningApplyStatus.Loading,
                    onClick: onApply,
                },
            ]}
        >
            {message}
        </DialogCommon>
    );
};

DialogManager.registerDialog(DIALOG_WARNING, withHiddenUnmount(DialogWarning));
export default withHiddenUnmount(DialogWarning);
