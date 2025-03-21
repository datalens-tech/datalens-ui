import React from 'react';

import type {ChartKitHtmlItem, MarkupItem} from 'shared';
import {MarkupItemTypes} from 'shared';
import {isMarkupItem} from 'shared/modules/markup';

import {Markup} from '../components/Markup';
import {
    ATTR_DATA_TOOLTIP_CONTENT,
    ATTR_DATA_TOOLTIP_PLACEMENT,
    TAG_DL_TOOLTIP,
} from '../libs/DatalensChartkit/modules/html-generator/constants';

export const getRenderMarkupToStringFn = async () => {
    const ReactDOMServer = await import(
        /* webpackChunkName: "react-dom/server" */ 'react-dom/server'
    );
    const renderToString = ReactDOMServer.renderToString;
    return function (value: MarkupItem) {
        return renderToString(<Markup item={value} />);
    };
};

export function mapMarkupToHtml(
    markup: MarkupItem | string | undefined,
): ChartKitHtmlItem | string {
    if (!isMarkupItem(markup)) {
        return typeof markup === 'string' ? markup : '';
    }

    switch (isMarkupItem(markup) && markup.type) {
        case MarkupItemTypes.Bold: {
            return {
                tag: 'b',
                content: mapMarkupToHtml(markup.content),
            };
        }
        case MarkupItemTypes.Br: {
            return {
                tag: 'br',
            };
        }
        case MarkupItemTypes.Color: {
            return {
                tag: 'span',
                content: mapMarkupToHtml(markup.content),
                style: {color: String(markup.color)},
            };
        }
        case MarkupItemTypes.Concat: {
            return {
                tag: 'span',
                content:
                    markup.children?.map((child) => mapMarkupToHtml(child) as ChartKitHtmlItem) ??
                    [],
            };
        }
        case MarkupItemTypes.Italics: {
            return {
                tag: 'i',
                content: mapMarkupToHtml(markup.content),
            };
        }
        case MarkupItemTypes.Size: {
            const fontSize = markup.size ?? '';
            return {
                tag: 'span',
                content: mapMarkupToHtml(markup.content),
                style: {fontSize, lineHeight: fontSize},
            };
        }
        case MarkupItemTypes.Text: {
            return String(markup.content ?? '');
        }
        case MarkupItemTypes.Url: {
            return {
                tag: 'a',
                content: mapMarkupToHtml(markup.content),
                attributes: {
                    view: 'normal',
                    href: markup.url ?? '',
                    target: '_blank',
                },
            };
        }
        case MarkupItemTypes.UserInfo: {
            return mapMarkupToHtml(markup.content);
        }
        case MarkupItemTypes.Image: {
            return {
                tag: 'img',
                attributes: {
                    src: markup.src,
                    alt: markup.alt,
                    width: markup.width,
                    height: markup.height,
                } as ChartKitHtmlItem['attributes'],
                content: mapMarkupToHtml(markup.content),
            };
        }
        case MarkupItemTypes.Tooltip: {
            return {
                tag: TAG_DL_TOOLTIP,
                attributes: {
                    [ATTR_DATA_TOOLTIP_CONTENT]: mapMarkupToHtml(markup.tooltip),
                    [ATTR_DATA_TOOLTIP_PLACEMENT]: markup.placement ?? ['auto'],
                } as ChartKitHtmlItem['attributes'],
                content: mapMarkupToHtml(markup.content),
            };
        }
    }

    return '';
}
