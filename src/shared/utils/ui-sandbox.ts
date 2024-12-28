import {WRAPPED_HTML_KEY} from '../constants';
import type {ChartKitHtmlItem, WrappedHTML} from '../types';

export function wrapHtml(value: ChartKitHtmlItem | string) {
    return {
        [WRAPPED_HTML_KEY]: value,
    };
}

export function isWrappedHTML(value: unknown): value is WrappedHTML {
    if (!value || typeof value !== 'object') {
        return false;
    }

    return WRAPPED_HTML_KEY in value;
}
