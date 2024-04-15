import React from 'react';

import {ClipboardButton} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './TemplateTextPaper.scss';

const b = block('template-text-paper');

type DetailsContentProps = {
    value?: string;
    className?: string;
};
type SourceDetailsProps = {
    title: string;
    content: string | Array<string | undefined> | undefined;
    contentClassName?: string;
};
const TemplateTextPaperContent = ({value, className}: DetailsContentProps) => {
    if (!value) {
        return null;
    }

    return (
        <div className={b('content', className)}>
            {value}
            <span className={b('clipboard-button')}>
                <ClipboardButton text={value} size="xs" />
            </span>
        </div>
    );
};
export const TemplateTextPaper = ({title, content, contentClassName}: SourceDetailsProps) => {
    const preparedContent = Array.isArray(content) ? content : [content];
    return (
        <div className={b()}>
            <div className={b('title')}>{title}</div>
            {preparedContent.map((value, index) => {
                return (
                    <TemplateTextPaperContent
                        key={`${value}_${index}`}
                        value={value}
                        className={contentClassName}
                    />
                );
            })}
        </div>
    );
};
