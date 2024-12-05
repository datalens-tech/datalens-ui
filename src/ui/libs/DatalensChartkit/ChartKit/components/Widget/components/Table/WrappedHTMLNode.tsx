import React from 'react';

import {WRAPPED_HTML_KEY} from 'shared';
import type {WrappedHTML} from 'shared';

import {generateHtml} from '../../../../../modules/html-generator';

type Props<T extends React.ElementType> = {
    value: WrappedHTML;
    as?: T;
    className?: string;
};

export function isWrappedHTML(value: unknown): value is WrappedHTML {
    if (!value || typeof value !== 'object') {
        return false;
    }

    return Object.keys(value).length === 1 && WRAPPED_HTML_KEY in value;
}

export function WrappedHTMLNode<T extends React.ElementType = 'div'>(props: Props<T>) {
    const {as, className, value} = props;
    const Tag: React.ElementType = as || 'span';

    return (
        <Tag
            className={className}
            dangerouslySetInnerHTML={{__html: generateHtml(value.__wrappedHTML__)}}
        />
    );
}
