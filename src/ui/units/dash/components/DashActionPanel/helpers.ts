import {I18n} from 'i18n';
import type {OpenDialogConfirmArguments} from 'ui/store/actions/dialog';

const i18n = I18n.keyset('dash.action-panel.view');

type CancelEditClickArgs = {
    isDraft?: boolean;
    setDefaultViewState: () => void;
    openDialogConfirm: (args: OpenDialogConfirmArguments) => void;
    closeDialogConfirm: () => void;
};

export const cancelEditClick = ({
    isDraft,
    setDefaultViewState,
    openDialogConfirm,
    closeDialogConfirm,
}: CancelEditClickArgs) => {
    if (isDraft) {
        openDialogConfirm({
            message: i18n('label_unsaved-changes-warning'),
            isWarningConfirm: true,
            cancelButtonView: 'flat',
            confirmButtonView: 'normal',
            onApply: () => {
                setDefaultViewState();
                closeDialogConfirm();
            },
            onCancel: () => {
                closeDialogConfirm();
            },
            widthType: 'medium',
            confirmHeaderText: i18n('label_unsaved-changes-title'),
            cancelButtonText: i18n('button_back'),
            confirmButtonText: i18n('button_continue'),
            showAlert: true,
        });

        return;
    }
    setDefaultViewState();
};
