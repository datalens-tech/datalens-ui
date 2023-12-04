import React from 'react';

import {
    Dialog,
    type DialogFooterProps,
    type DialogHeaderProps,
    type DialogProps,
    Sheet,
} from '@gravity-ui/uikit';
import {isMobileView} from 'ui/utils/mobile';

type AdaptiveDialogProps = {
    visible: boolean;
    onClose: () => void;
    sheetContentClassName?: string;
    dialogBodyClassName?: string;
    renderSheetFooter?: () => React.ReactNode;
    renderDialogFooter?: () => React.ReactNode;
    dialogProps?: Pick<DialogProps, 'disableEscapeKeyDown' | 'disableOutsideClick' | 'className'>;
    dialogHeaderProps?: DialogHeaderProps;
    dialogFooterProps?: DialogFooterProps;
};

export const AdaptiveDialog: React.FC<AdaptiveDialogProps> = ({
    children,
    onClose,
    renderSheetFooter,
    renderDialogFooter,
    sheetContentClassName,
    dialogBodyClassName,
    dialogProps,
    dialogHeaderProps,
    dialogFooterProps,
    visible,
}) => {
    const showDialogFooter = renderDialogFooter || dialogFooterProps;
    return isMobileView ? (
        <Sheet
            visible={visible}
            onClose={onClose}
            allowHideOnContentScroll={false}
            contentClassName={sheetContentClassName}
        >
            {children}
            {renderSheetFooter?.()}
        </Sheet>
    ) : (
        <Dialog open={visible} onClose={onClose} {...dialogProps}>
            <Dialog.Header {...dialogHeaderProps} />
            <Dialog.Body className={dialogBodyClassName}>{children}</Dialog.Body>
            {showDialogFooter && (
                <Dialog.Footer {...dialogFooterProps}>{renderDialogFooter?.()}</Dialog.Footer>
            )}
        </Dialog>
    );
};
