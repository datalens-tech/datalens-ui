import {WRAPPED_HTML_KEY} from '../constants';
import type {ChartKitHtmlItem} from '../types';

export function wrapHtml(value: ChartKitHtmlItem | string) {
    return {
        [WRAPPED_HTML_KEY]: value,
    };
}
