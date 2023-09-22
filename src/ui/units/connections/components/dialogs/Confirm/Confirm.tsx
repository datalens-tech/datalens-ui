import React from 'react';

import {Dialog} from '@gravity-ui/uikit';

import type {DialogConfirmProps} from './types';

export const Confirm = (props: DialogConfirmProps) => {
    const {description, dialogProps, headerProps, bodyProps, footerProps, onClose, onApply} = props;

    return (
        <Dialog {...dialogProps} open={true} onClose={onClose}>
            <Dialog.Header {...headerProps} />
            <Dialog.Body {...bodyProps}>{description}</Dialog.Body>
            <Dialog.Footer
                {...footerProps}
                onClickButtonApply={onApply}
                onClickButtonCancel={onClose}
            />
        </Dialog>
    );
};
