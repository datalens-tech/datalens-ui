import React from 'react';

import type {ButtonView} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {DialogInfoQA} from 'shared/constants/qa';

import {withHiddenUnmount} from '../../hoc/withHiddenUnmount';
import DialogCommon from '../DialogCommon/DialogCommon';
import DialogManager from '../DialogManager/DialogManager';

const i18n = I18n.keyset('component.dialog-info.view');

export interface DialogInfoProps {
    onСlose: (event?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
    visible: boolean;
    message: React.ReactNode;
    closeButtonText?: string;
    headerText?: string;
    isWarning?: boolean;
    showIcon?: boolean;
    closeOnEnterPress?: boolean;
    widthType?: 'medium'; // dialog width presets
    closeButtonView?: ButtonView;
    showAlert?: boolean;
}

export const DIALOG_INFO = Symbol('DIALOG_INFO');

export type OpenDialogInfoArgs = {
    id: typeof DIALOG_INFO;
    props: DialogInfoProps;
};

const DialogInfo: React.FC<DialogInfoProps> = (props) => {
    const {
        onСlose,
        message,
        closeButtonText,
        closeOnEnterPress,
        visible,
        isWarning,
        headerText,
        widthType,
        showIcon = false,
        closeButtonView = 'normal',
        showAlert,
    } = props;

    return (
        <DialogCommon
            visible={visible}
            widthType={widthType}
            isWarning={isWarning}
            headerText={headerText}
            closeOnEnterPress={closeOnEnterPress}
            showIcon={showIcon}
            showAlert={showAlert}
            qa={DialogInfoQA.Dialog}
            onClose={() => onСlose()}
            actions={[
                {
                    qa: DialogInfoQA.CloseButton,
                    text: closeButtonText || i18n('button_close'),
                    view: closeButtonView,
                    onClick: onСlose,
                },
            ]}
        >
            {message}
        </DialogCommon>
    );
};

DialogManager.registerDialog(DIALOG_INFO, withHiddenUnmount(DialogInfo));
export default withHiddenUnmount(DialogInfo);
