import isFunction from 'lodash/isFunction';
import {WRAPPED_FN_KEY, WRAPPED_HTML_KEY, WizardType, isObjectWith} from 'shared';
import {EDITOR_TYPE} from 'shared/constants/entry';

function isHtmlString(value: unknown) {
    return typeof value === 'string' && /<\/?[a-z][\s\S]*>/i.test(value);
}

const EDITOR_UNSAFE_CHART_TYPES = [
    EDITOR_TYPE.GRAPH_NODE,
    EDITOR_TYPE.MAP_NODE,
    EDITOR_TYPE.YMAP_NODE,
    EDITOR_TYPE.TIMESERIES_NODE,
    EDITOR_TYPE.BLANK_CHART_NODE,
    EDITOR_TYPE.ADVANCED_CHART_NODE,
    EDITOR_TYPE.GRAVITY_CHARTS_NODE,
];

const WIZARD_UNSAFE_CHART_TYPES = [WizardType.GraphWizardNode, WizardType.GravityChartsWizardNode];

export function isPotentiallyUnsafeChart(chartType: string) {
    return (
        (EDITOR_UNSAFE_CHART_TYPES as string[]).includes(chartType) ||
        (WIZARD_UNSAFE_CHART_TYPES as string[]).includes(chartType)
    );
}

export function getSafeChartWarnings(chartType: string, widgetData?: unknown) {
    if (isPotentiallyUnsafeChart(chartType)) {
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
