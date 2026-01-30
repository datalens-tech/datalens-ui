import React from 'react';

import {I18n} from 'i18n';
import DialogConfirm, {DialogConfirmApplyStatus} from 'ui/components/DialogConfirm/DialogConfirm';

const i18n = I18n.keyset('component.collections-structure');

export type Props = {
    title: string;
    description?: React.ReactNode;
    textButtonApply: string;
    open: boolean;
    isLoading: boolean;
    onApply: () => Promise<unknown>;
    onClose: () => void;
};

export const DeleteDialog = React.memo<Props>(
    ({title, description, textButtonApply, open, isLoading, onApply, onClose}) => {
        const handleApply = React.useCallback(() => {
            onApply().then(() => {
                onClose();
            });
        }, [onApply, onClose]);

        return (
            <DialogConfirm
                visible={open}
                onCancel={onClose}
                confirmOnEnterPress={true}
                onApply={handleApply}
                confirmHeaderText={title}
                applyBtnLoadingStatus={isLoading ? DialogConfirmApplyStatus.Loading : undefined}
                confirmButtonText={textButtonApply}
                confirmButtonView="outlined-danger"
                cancelButtonView="flat"
                cancelButtonText={i18n('action_cancel')}
                message={description}
                showIcon={false}
                isWarningConfirm={true}
            />
        );
    },
);

DeleteDialog.displayName = 'DeleteDialog';
