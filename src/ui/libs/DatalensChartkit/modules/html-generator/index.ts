import escape from 'lodash/escape';

import type {ChartKitHtmlItem} from '../../../../../shared';
import {ChartKitCustomError} from '../../ChartKit/modules/chartkit-custom-error/chartkit-custom-error';
import {getRandomCKId} from '../../helpers/helpers';

import {
    ALLOWED_ATTRIBUTES,
    ALLOWED_REFERENCES,
    ALLOWED_TAGS,
    ATTR_DATA_TOOLTIP_CONTENT,
    ATTR_DATA_TOOLTIP_PLACEMENT,
    TAG_DL_TOOLTIP,
} from './constants';

const ATTRS_WITH_REF_VALIDATION = ['background', 'href', 'src'];
const TOOLTIP_ATTRS = [ATTR_DATA_TOOLTIP_CONTENT, ATTR_DATA_TOOLTIP_PLACEMENT];

export function generateHtml(item?: ChartKitHtmlItem | ChartKitHtmlItem[] | string): string {
    if (item) {
        if (Array.isArray(item)) {
            return item.map(generateHtml).join('');
        }

        if (typeof item === 'string') {
            return escape(item);
        }

        const {tag, attributes = {}, style = {}, content} = item;

        if (!ALLOWED_TAGS.includes(tag)) {
            throw new ChartKitCustomError(null, {
                details: `Tag '${tag}' is not allowed`,
            });
        }

        const isDLTooltip = tag === TAG_DL_TOOLTIP;
        const elem = document.createElement(isDLTooltip ? 'div' : tag);
        Object.assign(elem.style, isDLTooltip ? {display: 'inline-block'} : {}, style);

        Object.entries(attributes).forEach(([key, value]) => {
            if (!ALLOWED_ATTRIBUTES.includes(key)) {
                throw new ChartKitCustomError(null, {
                    details: `Attribute '${key}' is not allowed`,
                });
            }

            if (ATTRS_WITH_REF_VALIDATION.includes(key)) {
                if (!ALLOWED_REFERENCES.some((ref) => String(value).startsWith(ref))) {
                    throw new ChartKitCustomError(null, {
                        details: `Attribute '${key}' is not valid`,
                    });
                }
            }

            const preparedValue = TOOLTIP_ATTRS.includes(key)
                ? JSON.stringify(value)
                : String(value);

            elem.setAttribute(key, preparedValue);
        });

        if (isDLTooltip) {
            elem.setAttribute('id', getRandomCKId());
        }

        elem.innerHTML = generateHtml(content);
        return elem.outerHTML;
    }

    return '';
}
