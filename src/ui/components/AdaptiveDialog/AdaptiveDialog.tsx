import React from 'react';

import {
    Dialog,
    type DialogFooterProps,
    type DialogHeaderProps,
    type DialogProps,
    Sheet,
} from '@gravity-ui/uikit';
import {DL} from 'ui/constants/common';

type AdaptiveDialogProps = {
    visible: boolean;
    id?: string;
    onClose: () => void;
    sheetClassName?: string;
    sheetContentClassName?: string;
    dialogBodyClassName?: string;
    title?: string;
    renderSheetFooter?: () => React.ReactNode;
    renderDialogFooter?: () => React.ReactNode;
    qa?: string;
    dialogProps?: Omit<DialogProps, 'open' | 'onClose' | 'qa' | 'children'>;
    dialogHeaderProps?: DialogHeaderProps;
    dialogFooterProps?: DialogFooterProps;
};

export const AdaptiveDialog: React.FC<AdaptiveDialogProps> = ({
    children,
    onClose,
    renderSheetFooter,
    renderDialogFooter,
    title,
    sheetClassName,
    sheetContentClassName,
    dialogBodyClassName,
    dialogProps,
    dialogHeaderProps,
    dialogFooterProps,
    visible,
    qa,
    id,
}) => {
    const showDialogFooter = renderDialogFooter || dialogFooterProps;

    return DL.IS_MOBILE ? (
        <Sheet
            visible={visible}
            onClose={onClose}
            allowHideOnContentScroll={false}
            className={sheetClassName}
            contentClassName={sheetContentClassName}
            qa={qa}
            id={id}
            title={title}
        >
            {children}
            {renderSheetFooter?.()}
        </Sheet>
    ) : (
        <Dialog open={visible} onClose={onClose} qa={qa} {...dialogProps}>
            <Dialog.Header caption={title} {...dialogHeaderProps} />
            <Dialog.Body className={dialogBodyClassName}>{children}</Dialog.Body>
            {showDialogFooter && (
                <Dialog.Footer {...dialogFooterProps}>{renderDialogFooter?.()}</Dialog.Footer>
            )}
        </Dialog>
    );
};
