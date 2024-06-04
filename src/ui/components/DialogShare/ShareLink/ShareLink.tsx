import type {ReactElement} from 'react';
import React from 'react';

import {ClipboardButton} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import '../DialogShare.scss';

const b = block('dialog-share');

type ShareLinkProps = {
    title: string;
    description?: string;
    text: string;
    textToCopy?: string;
    showDescription?: boolean;
    additionalContent?: ReactElement;
};

export const ShareLink: React.FC<ShareLinkProps> = ({
    title,
    description,
    text,
    textToCopy,
    showDescription,
    additionalContent,
}) => {
    const isDescriptionVisible = description && showDescription;

    return (
        <div className={b('share-link')}>
            <div className={b('subheader')}>{title}</div>
            {isDescriptionVisible && <div className={b('description')}>{description}</div>}
            {additionalContent}
            <div className={b('copy-block', {'big-top-margin': Boolean(!isDescriptionVisible)})}>
                <div className={b('text-field')}>{text}</div>
                <ClipboardButton
                    className={b('clipboard-button')}
                    size="m"
                    text={textToCopy || text}
                />
            </div>
        </div>
    );
};
