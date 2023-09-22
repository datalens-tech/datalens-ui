import React from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import './ViewError.scss';

export interface ViewErrorProps {
    className?: string;
    errorText?: string;
    buttonText?: string;
    onClick?: () => void;
    withButton?: boolean;
}

const b = block('editor-view-error');
const i18n = I18n.keyset('editor.common.view');

export const ViewError: React.FC<ViewErrorProps> = ({
    className,
    buttonText = i18n('button_retry'),
    errorText = i18n('label_load-failed'),
    onClick,
    withButton = true,
}: ViewErrorProps) => {
    return (
        <div className={b(null, className)}>
            <span className={b('error-text')}>{errorText}</span>
            <br />
            {withButton && (
                <Button view="action" size="m" onClick={() => onClick?.()}>
                    {buttonText}
                </Button>
            )}
        </div>
    );
};
