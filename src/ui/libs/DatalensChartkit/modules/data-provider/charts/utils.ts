import isFunction from 'lodash/isFunction';
import {WRAPPED_FN_KEY, WRAPPED_HTML_KEY, isObjectWith} from 'shared';

import {DL} from '../../../../../constants';

export const isEmbeddedChart = () => DL.EMBED?.mode === 'chart';

function isJson(value: string) {
    try {
        JSON.parse(value);
        return true;
    } catch (_e) {
        return false;
    }
}

function isHighchartsTemplateString(value: string) {
    if (isJson(value)) {
        return false;
    }

    const hc = window.Highcharts;
    return typeof hc !== 'undefined' && hc.format(value, {}) !== value;
}

function isHtmlString(value: unknown) {
    if (typeof value === 'string') {
        if (/<\/?[a-z][\s\S]*>/i.test(value) || isHighchartsTemplateString(value)) {
            return true;
        }
    }

    return false;
}

export function getSafeChartWarnings(widgetData?: unknown) {
    const ignoreAttrs = [WRAPPED_FN_KEY, WRAPPED_HTML_KEY];
    const pathToFunction = isObjectWith(widgetData, isFunction, ignoreAttrs);
    if (pathToFunction) {
        return `has functions at \`${pathToFunction}\``;
    }

    const pathToHtml = isObjectWith(widgetData, isHtmlString, ignoreAttrs);
    if (pathToHtml) {
        return `has HTML string at \`${pathToHtml}\``;
    }

    return undefined;
}
