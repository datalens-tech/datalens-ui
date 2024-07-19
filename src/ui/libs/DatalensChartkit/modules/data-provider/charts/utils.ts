import isFunction from 'lodash/isFunction';
import {WRAPPED_FN_KEY, WRAPPED_HTML_KEY, isObjectWith} from 'shared';

function isHtmlString(value: unknown) {
    return typeof value === 'string' && /<\/?[a-z][\s\S]*>/i.test(value);
}

export function getSafeChartWarnings(chartType: string, widgetData?: unknown) {
    const chartTypesToCheck = [
        'graph_node',
        'map_node',
        'ymap_node',
        'timeseries_node',
        'table_node',
    ];

    if (chartTypesToCheck.includes(chartType)) {
        const ignoreAttrs = [WRAPPED_FN_KEY, WRAPPED_HTML_KEY];
        const pathToFunction = isObjectWith(widgetData, isFunction, ignoreAttrs);
        if (pathToFunction) {
            return `has functions at \`${pathToFunction.replace('libraryConfig.', '')}\``;
        }

        const pathToHtml = isObjectWith(widgetData, isHtmlString, ignoreAttrs);
        if (pathToHtml) {
            return `has HTML string at \`${pathToHtml.replace('libraryConfig.', '')}\``;
        }
    }

    return undefined;
}
