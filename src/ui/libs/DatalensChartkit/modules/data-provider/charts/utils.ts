import {isObjectWith, isObjectWithFunction} from 'shared';
import type {ChartsData} from 'ui/libs/DatalensChartkit/modules/data-provider/charts/types';
import type {Widget, WithControls} from 'ui/libs/DatalensChartkit/types';
import type {Optional} from 'utility-types';

import {DL} from '../../../../../constants';

export const isEmbeddedChart = () => DL.EMBED?.mode === 'chart';

function isHighchartsTemplateString(value: string) {
    const hc = window.Highcharts;
    return typeof hc !== 'undefined' && hc.format(value, {}) !== value;
}

function isHtmlString(value: unknown) {
    if (typeof value === 'string') {
        const el = document.createElement('div');
        el.innerHTML = value;

        if (Array.from(el.childNodes).some((node) => node.nodeName !== '#text')) {
            return true;
        }

        if (isHighchartsTemplateString(value)) {
            return true;
        }
    }

    return false;
}

export function getChartDebugInfo(widgetData?: Widget & Optional<WithControls> & ChartsData) {
    const pathToFunction = isObjectWithFunction(widgetData);
    if (pathToFunction) {
        return `has functions at ${pathToFunction}`;
    }

    const pathToHtml = isObjectWith(widgetData, isHtmlString);
    if (pathToHtml) {
        return `has HTML string at ${pathToHtml}`;
    }

    return undefined;
}
