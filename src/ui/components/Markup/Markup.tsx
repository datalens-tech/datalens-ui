import React from 'react';

import {sanitizeUrl} from '@braintree/sanitize-url';
import {Link} from '@gravity-ui/uikit';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import type {MarkupItem, MarkupItemType} from 'shared';
import {MarkupItemTypes, isMarkupItem, markupToRawString} from 'shared';

import {getRandomCKId} from '../../libs/DatalensChartkit/helpers/helpers';
import {ATTR_DATA_TOOLTIP_ANCHOR_ID} from '../../libs/DatalensChartkit/modules/html-generator/constants';

import {MarkupTooltip, UserInfo} from './components';
import type {TemplateItem} from './types';
import {isNumericCSSValueValid} from './utils';

type MarkupProps = {
    item: MarkupItem;
    externalProps?: Partial<Record<MarkupItemType, Record<string, unknown>>>;
    renderToString?: (element: React.ReactElement) => string;
};

// eslint-disable-next-line complexity
function getConfig({
    markupItem,
    externalProps,
    configItem,
    config,
    renderToString,
}: {
    markupItem?: string | MarkupItem;
    externalProps?: MarkupProps['externalProps'];
    configItem?: TemplateItem;
    config?: TemplateItem;
    renderToString?: (element: React.ReactElement) => string;
}): TemplateItem {
    if (!markupItem) {
        return config as TemplateItem;
    }

    const iteratedConfigItem = configItem || {children: []};
    const childProps: Record<string, string> = {};

    if (typeof markupItem === 'string') {
        iteratedConfigItem.children.push(markupItem);
        return config as TemplateItem;
    }

    if (markupItem.className) {
        iteratedConfigItem.props = merge(iteratedConfigItem.props, {
            className: markupItem.className,
        });
    }

    if (markupItem.type === MarkupItemTypes.Text) {
        iteratedConfigItem.children.push(markupItem.content as TemplateItem);

        if (!config) {
            iteratedConfigItem.element = 'span';
        }

        return config || iteratedConfigItem;
    }

    switch (markupItem.type) {
        case MarkupItemTypes.Bold: {
            iteratedConfigItem.element = 'b';
            break;
        }
        case MarkupItemTypes.Br: {
            iteratedConfigItem.element = 'br';
            break;
        }
        case MarkupItemTypes.Color: {
            iteratedConfigItem.props = merge(iteratedConfigItem.props, {
                style: {color: markupItem.color},
            });
            break;
        }
        case MarkupItemTypes.Concat: {
            iteratedConfigItem.element = 'span';

            if (markupItem.children) {
                iteratedConfigItem.children.push(
                    ...markupItem.children.map((child) => {
                        return getConfig({
                            markupItem: child,
                            externalProps,
                            configItem: {children: []},
                            renderToString,
                        });
                    }),
                );
            }

            break;
        }
        case MarkupItemTypes.Italics: {
            iteratedConfigItem.element = 'i';
            break;
        }
        case MarkupItemTypes.Size: {
            const fontSize = isNumericCSSValueValid(markupItem.size) ? markupItem.size : undefined;

            if (fontSize) {
                iteratedConfigItem.props = merge(iteratedConfigItem.props, {
                    style: {fontSize, lineHeight: fontSize},
                });
            }
            break;
        }
        case MarkupItemTypes.Url: {
            const href = sanitizeUrl(markupItem.url || '');
            iteratedConfigItem.element = Link as TemplateItem['element'];
            iteratedConfigItem.props = merge(iteratedConfigItem.props, {
                view: 'normal',
                href,
                target: '_blank',
                extraProps: omit(iteratedConfigItem.props, 'view', 'href', 'target'),
            });
            break;
        }
        case MarkupItemTypes.UserInfo: {
            const {content, user_info: fieldName} = markupItem;
            const userId = isMarkupItem(content) ? markupToRawString(content) : content;
            iteratedConfigItem.element = UserInfo;
            iteratedConfigItem.props = {
                userId: String(userId),
                fieldName: String(fieldName),
            };
            break;
        }
        case MarkupItemTypes.Image: {
            iteratedConfigItem.element = 'img';
            iteratedConfigItem.props = merge(iteratedConfigItem.props, {
                src: markupItem.src,
                alt: markupItem.alt,
                width: markupItem.width,
                height: markupItem.height,
            });
            break;
        }
        case MarkupItemTypes.Tooltip: {
            iteratedConfigItem.element = MarkupTooltip;
            const tooltipId = getRandomCKId();

            iteratedConfigItem.props = {
                tooltipId,
                content: markupItem.tooltip ? <Markup item={markupItem.tooltip} /> : '',
                ...(markupItem.placement && {placement: markupItem.placement}),
                renderToString: renderToString as any,
            };

            childProps[ATTR_DATA_TOOLTIP_ANCHOR_ID] = tooltipId;

            break;
        }
    }

    if (externalProps?.[markupItem.type]) {
        iteratedConfigItem.props = merge(iteratedConfigItem.props, externalProps[markupItem.type]);
    }

    const content = markupItem.content as MarkupItem;
    let nextConfigItem: TemplateItem = {children: [], props: {...childProps}};

    if (content?.type && content.type !== MarkupItemTypes.Text) {
        iteratedConfigItem.children.push(nextConfigItem);
    } else {
        nextConfigItem = iteratedConfigItem;
    }

    const nextConfig = config || iteratedConfigItem;

    return getConfig({
        markupItem: markupItem.content,
        externalProps,
        configItem: nextConfigItem,
        config: nextConfig,
        renderToString,
    });
}

export function renderTemplate(templateItem: TemplateItem | string): JSX.Element {
    if (typeof templateItem === 'string') {
        // Part of ReactNode type is undefined, which is not a valid JSX element
        // Wrapping the result in a fragment solves this issue
        return <React.Fragment>{templateItem}</React.Fragment>;
    }

    return React.createElement(
        templateItem.element || 'span',
        templateItem.props,
        ...templateItem.children.map((child) => renderTemplate(child)),
    );
}

export function Markup(props: MarkupProps) {
    const {item: markupItem, externalProps, renderToString} = props;
    const template = getConfig({markupItem, externalProps, renderToString});

    return renderTemplate(template);
}

export default Markup;
