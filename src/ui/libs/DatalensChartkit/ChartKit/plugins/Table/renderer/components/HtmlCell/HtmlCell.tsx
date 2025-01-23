import React from 'react';

import {Link, Loader} from '@gravity-ui/uikit';
import type {ChartKitHtmlItem} from 'shared';

import {generateHtml} from '../../../../../../modules/html-generator';
import {getParseHtmlFn} from '../../../../../../modules/html-generator/utils';

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
    const shouldParseValue = typeof content === 'string';
    const initialValue = shouldParseValue ? null : content;
    const [htmlContent, setHtmlContent] = React.useState(initialValue);

    const parseHtmlValue = async () => {
        const parseHtml = await getParseHtmlFn();
        setHtmlContent(parseHtml(content));
    };

    React.useEffect(() => {
        if (shouldParseValue) {
            parseHtmlValue();
        }
    }, [content]);

    if (shouldParseValue && !htmlContent) {
        return <Loader size="s" />;
    }

    if (isLink(htmlContent)) {
        const {attributes: {href, target} = {}, content: linkContent} = htmlContent;
        return (
            <Link view="normal" href={String(href)} target={String(target)}>
                <div dangerouslySetInnerHTML={{__html: generateHtml(linkContent)}} />
            </Link>
        );
    }

    return <div dangerouslySetInnerHTML={{__html: generateHtml(htmlContent)}} />;
};
