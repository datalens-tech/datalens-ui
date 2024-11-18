import React from 'react';

import type {DialogProps} from '@gravity-ui/uikit';
import {Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './TwoColumnDialog.scss';

const b = block('two-column-dialog');

type TwoColumnDialogOwnProps = {
    sidebar: string | React.ReactElement;
    sidebarHeader: string | React.ReactElement;
    body: string | React.ReactElement;
    bodyHeader?: string | React.ReactElement;
    footer: string | React.ReactElement;
    contentClassMixin?: string;
    sidebarClassMixin?: string;
    bodyClassMixin?: string;
    headerClassMixin?: string;
    qa?: string;
    withoutSidebar?: boolean;
};

type TwoColumnDialogProps = TwoColumnDialogOwnProps & Omit<DialogProps, 'children'>;

function TwoColumnDialog({
    sidebar,
    sidebarHeader,
    body,
    bodyHeader,
    footer,
    contentClassMixin,
    sidebarClassMixin,
    bodyClassMixin,
    headerClassMixin,
    withoutSidebar,
    ...dialogProps
}: TwoColumnDialogProps) {
    const preparedBodyHeader = withoutSidebar ? sidebarHeader : bodyHeader;

    const hideHeader = !preparedBodyHeader;

    return (
        <Dialog {...dialogProps}>
            <div className={b()}>
                {!withoutSidebar && (
                    <div className={b('sidebar', sidebarClassMixin)}>
                        <Dialog.Header className={b('header')} caption={sidebarHeader} />
                        <Dialog.Body className={b('sidebar-body')}>{sidebar}</Dialog.Body>
                    </div>
                )}
                <div className={b('content', {'no-content-header': hideHeader}, contentClassMixin)}>
                    {!hideHeader && (
                        <Dialog.Header className={headerClassMixin} caption={preparedBodyHeader} />
                    )}
                    <Dialog.Body
                        className={b(
                            'content-body',
                            {'without-sidebar': withoutSidebar},
                            bodyClassMixin,
                        )}
                    >
                        {body}
                    </Dialog.Body>
                    {footer}
                </div>
            </div>
        </Dialog>
    );
}

export default TwoColumnDialog;
