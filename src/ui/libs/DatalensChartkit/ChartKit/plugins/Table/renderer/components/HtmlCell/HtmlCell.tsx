import React from 'react';

import {Link} from '@gravity-ui/uikit';
import type {ChartKitHtmlItem} from 'shared';

import {generateHtml} from '../../../../../../modules/html-generator';

type HtmlCellProps = {
    content?: ChartKitHtmlItem['content'];
};

/* check that the object is a link and that a valid html can be generated */
function isLink(item: ChartKitHtmlItem['content']): item is ChartKitHtmlItem {
    const isLinkItem = item && typeof item === 'object' && 'tag' in item && item.tag === 'a';

    return Boolean(isLinkItem && generateHtml(item));
}

export const HtmlCell = (props: HtmlCellProps) => {
    const {content} = props;

    if (isLink(content)) {
        const {attributes: {href, target} = {}, content: linkContent} = content;
        return (
            <Link view="normal" href={String(href)} target={String(target)}>
                <div dangerouslySetInnerHTML={{__html: generateHtml(linkContent)}} />
            </Link>
        );
    }

    const htmlContent = generateHtml(content);
    return <div dangerouslySetInnerHTML={{__html: htmlContent}} />;
};
