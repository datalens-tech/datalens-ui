import React from 'react';

import {Dialog, DialogProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './TwoColumnDialog.scss';

const b = block('two-column-dialog');

type TwoColumnDialogOwnProps = {
    sidebar: string | React.ReactElement;
    sidebarHeader: string | React.ReactElement;
    body: string | React.ReactElement;
    bodyHeader: string | React.ReactElement;
    footer: string | React.ReactElement;
    hideSideBar?: boolean;
    contentClassMixin?: string;
    sidebarClassMixin?: string;
};

type TwoColumnDialogProps = TwoColumnDialogOwnProps & Omit<DialogProps, 'children'>;

function TwoColumnDialog({
    sidebar,
    sidebarHeader,
    body,
    bodyHeader,
    footer,
    hideSideBar,
    contentClassMixin,
    sidebarClassMixin,
    ...dialogProps
}: TwoColumnDialogProps) {
    return (
        <Dialog {...dialogProps}>
            <div className={b()}>
                {!hideSideBar && (
                    <div className={b('sidebar', sidebarClassMixin)}>
                        <Dialog.Header caption={sidebarHeader} />
                        <Dialog.Body className={b('sidebar-body')}>{sidebar}</Dialog.Body>
                    </div>
                )}
                <div className={b('content', {'no-sidebar': hideSideBar}, contentClassMixin)}>
                    <Dialog.Header caption={bodyHeader} />
                    <Dialog.Body className={b('content-body')}>{body}</Dialog.Body>
                    {footer}
                </div>
            </div>
        </Dialog>
    );
}

export default TwoColumnDialog;
