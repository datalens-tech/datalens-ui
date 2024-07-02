import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import {I18n} from 'i18n';

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
            <Dialog size="s" open={open} onClose={onClose} onEnterKeyDown={handleApply}>
                <Dialog.Header caption={title} />
                {description && <Dialog.Body>{description}</Dialog.Body>}
                <Dialog.Footer
                    onClickButtonCancel={onClose}
                    onClickButtonApply={handleApply}
                    textButtonApply={textButtonApply}
                    textButtonCancel={i18n('action_cancel')}
                    loading={isLoading}
                />
            </Dialog>
        );
    },
);

DeleteDialog.displayName = 'DeleteDialog';
