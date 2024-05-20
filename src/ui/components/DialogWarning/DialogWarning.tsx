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
    buttonText?: string;
    headerText?: string;
    showIcon?: boolean;
    closeOnEnterPress?: boolean;
    widthType?: 'medium'; // dialog width presets
    applyBtnLoadingStatus?: DialogWarningApplyStatus;
    buttonView?: ButtonView;
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
        buttonText,
        closeOnEnterPress,
        visible,
        onApply,
        headerText,
        widthType,
        applyBtnLoadingStatus,
        showIcon = true,
        buttonView = 'action',
        showAlert,
    } = props;

    return (
        <DialogCommon
            visible={visible}
            widthType={widthType}
            headerText={headerText}
            closeOnEnterPress={closeOnEnterPress}
            showIcon={showIcon}
            showAlert={showAlert}
            qa={DialogWarningQA.Dialog}
            onClose={() => onApply()}
            isWarning={true}
            actions={[
                {
                    qa: DialogWarningQA.ApplyButton,
                    text: buttonText || i18n('button_apply'),
                    view: buttonView,
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
