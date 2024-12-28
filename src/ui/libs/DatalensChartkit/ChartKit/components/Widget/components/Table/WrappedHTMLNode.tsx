import React from 'react';

import type {WrappedHTML} from 'shared';

import {generateHtml} from '../../../../../modules/html-generator';

type Props<T extends React.ElementType> = {
    value: WrappedHTML;
    as?: T;
    className?: string;
};

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
