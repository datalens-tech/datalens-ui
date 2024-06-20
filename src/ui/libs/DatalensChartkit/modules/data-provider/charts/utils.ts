import {isObjectWith, isObjectWithFunction} from 'shared';

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

function hasChildNodes(value: string) {
    const el = document.createElement('div');
    el.innerHTML = value;

    return Array.from(el.childNodes).some((node) => node.nodeName !== '#text');
}

function isHtmlString(value: unknown) {
    if (typeof value === 'string') {
        if (hasChildNodes(value) || isHighchartsTemplateString(value)) {
            return true;
        }
    }

    return false;
}

export function getSafeChartWarnings(widgetData?: unknown) {
    const pathToFunction = isObjectWithFunction(widgetData);
    if (pathToFunction) {
        return `has functions at \`${pathToFunction}\``;
    }

    const pathToHtml = isObjectWith(widgetData, isHtmlString);
    if (pathToHtml) {
        return `has HTML string at \`${pathToHtml}\``;
    }

    return undefined;
}
