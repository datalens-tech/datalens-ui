import {isObjectWith, isObjectWithFunction} from 'shared';
import type {Optional} from 'utility-types';

import {DL} from '../../../../../constants';
import type {Widget, WithControls} from '../../../types';

import type {ChartsData} from './types';

export const isEmbeddedChart = () => DL.EMBED?.mode === 'chart';

function isHighchartsTemplateString(value: string) {
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

export function getSafeChartWarnings(widgetData?: Widget & Optional<WithControls> & ChartsData) {
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
