import React from 'react';

import {ArrowUpRightFromSquare} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {URL_QUERY} from 'ui/constants/common';

interface ButtonNewWindowProps {
    className?: string;
    revId?: string;
    disabled?: boolean;
}

const b = block('revisions-diff-btn-new-window');

const openNewWindow = (revId?: string) => {
    const url = new URL(window.location.href);
    if (revId) url.searchParams.set(URL_QUERY.REV_ID, revId);
    window.open(url.href, '_blank');
};

export const ButtonNewWindow: React.FC<ButtonNewWindowProps> = ({
    revId,
    className,
    disabled = false,
}: ButtonNewWindowProps) => {
    const onClick = React.useCallback(() => {
        openNewWindow(revId);
    }, [revId]);

    return (
        <Button
            view="flat"
            size="s"
            className={b(null, className)}
            disabled={disabled}
            onClick={onClick}
            title={i18n(
                'component.dialog-revisions-diff.view',
                'button_open-revision-in-new-window',
            )}
        >
            <Icon data={ArrowUpRightFromSquare} size={16} />
        </Button>
    );
};
