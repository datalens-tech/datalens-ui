import React from 'react';

import {Link} from '@gravity-ui/uikit';
import merge from 'lodash/merge';

import type {MarkupItem, MarkupItemType} from '../../../shared';
import {MarkupItemTypes, isMarkupItem, markupToRawString} from '../../../shared';
import {validateUrl} from '../../libs/DatalensChartkit/modules/html-generator/utils';

import {UserInfo} from './components/UserInfo/UserInfo';
import {isNumericCSSValueValid} from './utils';

type TemplateItem = {
    children: (TemplateItem | string)[];
    element?: string | React.ComponentClass | React.ExoticComponent | React.FC;
    props?: {[key: string]: string | Record<string, unknown>};
};

type Props = {
    item: MarkupItem;
    externalProps?: Partial<Record<MarkupItemType, Record<string, unknown>>>;
};

// eslint-disable-next-line complexity
const getConfig = (
    markupItem?: string | MarkupItem,
    externalProps?: Props['externalProps'],
    configItem?: TemplateItem,
    config?: TemplateItem,
): TemplateItem => {
    if (!markupItem) {
        return config as TemplateItem;
    }

    const iteratedConfigItem = configItem || {children: []};

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
                        return getConfig(child, externalProps, {children: []});
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
            const href = markupItem.url || '';
            validateUrl(href);
            iteratedConfigItem.element = Link as TemplateItem['element'];
            iteratedConfigItem.props = merge(iteratedConfigItem.props, {
                view: 'normal',
                href,
                target: '_blank',
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
    }

    if (externalProps?.[markupItem.type]) {
        iteratedConfigItem.props = merge(iteratedConfigItem.props, externalProps[markupItem.type]);
    }

    const content = markupItem.content as MarkupItem;
    let nextConfigItem: TemplateItem = {children: []};

    if (content?.type && content.type !== MarkupItemTypes.Text) {
        iteratedConfigItem.children.push(nextConfigItem);
    } else {
        nextConfigItem = iteratedConfigItem;
    }

    const nextConfig = config || iteratedConfigItem;

    return getConfig(markupItem.content, externalProps, nextConfigItem, nextConfig);
};

const renderTemplate = (templateItem: TemplateItem | string): JSX.Element => {
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
};

export default (props: Props) => renderTemplate(getConfig(props.item, props.externalProps));
