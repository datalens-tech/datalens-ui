/* eslint complexity: 0, no-param-reassign: 0, @typescript-eslint/no-explicit-any: 0 */

import React from 'react';

import {Link} from '@gravity-ui/uikit';
import merge from 'lodash/merge';

import {MarkupItem, MarkupItemType} from './types';
import {isNumericCSSValueValid} from './utils';

type TemplateItem = {
    children: (TemplateItem | string)[];
    element?: string | React.ComponentClass | React.ExoticComponent;
    props?: {[key: string]: string | Record<string, any>};
};

type Props = {
    item: MarkupItem;
    externalProps?: Partial<Record<MarkupItemType, Record<string, any>>>;
};

const getConfig = (
    markupItem?: string | MarkupItem,
    externalProps?: Props['externalProps'],
    configItem: TemplateItem = {children: []},
    config?: TemplateItem,
): TemplateItem => {
    if (!markupItem) {
        return config as TemplateItem;
    }

    if (typeof markupItem === 'string') {
        configItem.children.push(markupItem);
        return config as TemplateItem;
    }

    if (markupItem.type === 'text') {
        configItem.children.push(markupItem.content as TemplateItem);

        if (!config) {
            configItem.element = 'span';
        }

        return config || configItem;
    }

    switch (markupItem.type) {
        case 'bold': {
            configItem.element = 'b';
            break;
        }
        case 'concat': {
            configItem.element = 'span';

            if (markupItem.children) {
                configItem.children.push(
                    ...markupItem.children.map((child) => {
                        return getConfig(child, externalProps, {children: []});
                    }),
                );
            }

            break;
        }
        case 'italics': {
            configItem.element = 'i';
            break;
        }
        case 'url': {
            configItem.element = Link;
            configItem.props = merge(configItem.props, {
                view: 'normal',
                href: markupItem.url || '',
                target: '_blank',
            });
            break;
        }
        case 'color': {
            configItem.props = merge(configItem.props, {style: {color: markupItem.color}});
            break;
        }
        case 'br': {
            configItem.element = 'br';
            break;
        }
        case 'size': {
            const fontSize = isNumericCSSValueValid(markupItem.size) ? markupItem.size : undefined;

            if (fontSize) {
                configItem.props = merge(configItem.props, {
                    style: {fontSize, lineHeight: fontSize},
                });
            }
        }
    }

    if (externalProps?.[markupItem.type]) {
        configItem.props = merge(configItem.props, externalProps[markupItem.type]);
    }

    const content = markupItem.content as MarkupItem;
    let nextConfigItem: TemplateItem = {children: []};

    if (content?.type && content.type !== 'text') {
        configItem.children.push(nextConfigItem);
    } else {
        nextConfigItem = configItem;
    }

    const nextConfig = config || configItem;

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

export default (props: Props) => {
    return renderTemplate(getConfig(props.item, props.externalProps));
};
