import isFunction from 'lodash/isFunction';
import pick from 'lodash/pick';
import {WRAPPED_FN_KEY, WRAPPED_HTML_KEY, WizardType, isObjectWith} from 'shared';
import {EDITOR_TYPE} from 'shared/constants/entry';

import type {TargetValue} from './types';

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

const HC_FORBIDDEN_ATTRS = [
    'chart',
    'this',
    'renderer',
    'container',
    'label',
    'axis',
    'legendItem',
    'legendGroup',
    'legendLine',
    'xAxis',
    'yAxis',
] as const;
const ALLOWED_SERIES_ATTRS = ['color', 'name', 'userOptions', 'state'];

const EVENT_KEYS = ['ctrlKey', 'altKey', 'shiftKey', 'metaKey'];

const MAX_NESTING_LEVEL = 5;
function removeSVGElements(val: unknown, nestingLevel = 0): unknown {
    if (nestingLevel > MAX_NESTING_LEVEL) {
        return undefined;
    }

    if (val && typeof val === 'object') {
        if (Array.isArray(val)) {
            if (val.some((item) => item instanceof window.Highcharts.SVGElement)) {
                return [];
            }

            return val.map((item) => removeSVGElements(item, nestingLevel + 1));
        } else {
            return Object.entries(val as object).reduce(
                (acc, [key, value]) => {
                    if (!(value instanceof window.Highcharts.SVGElement)) {
                        acc[key] = removeSVGElements(value, nestingLevel + 1);
                    }

                    return acc;
                },
                {} as Record<string, unknown>,
            );
        }
    }

    return val;
}

function getChartProps(chart: unknown) {
    return pick(chart, 'chartHeight', 'chartWidth', 'index');
}

export function clearVmProp(prop: unknown): unknown {
    if (prop && typeof prop === 'object') {
        if (Array.isArray(prop)) {
            return prop.map(clearVmProp);
        }

        if ('angular' in prop) {
            // It looks like it's Highcharts.Chart - preparing a minimum of attributes for the entity
            return getChartProps(prop);
        }

        // instanceof Event
        const eventProps = 'preventDefault' in prop ? pick(prop, EVENT_KEYS) : {};

        const item: Record<string, TargetValue> = {...(prop as object)};
        HC_FORBIDDEN_ATTRS.forEach((attr) => {
            if (attr in item) {
                if (attr === 'this' && Array.isArray(item[attr]?.points)) {
                    item[attr].points = item[attr].points.map(clearVmProp);
                    return;
                }

                delete item[attr];
            }
        });

        // eslint-disable-next-line prefer-const
        let {series, point, points, this: _this, ...other} = item;
        if (typeof series !== 'undefined') {
            series = pick(series, ...ALLOWED_SERIES_ATTRS);
            delete series.userOptions.data;
        }

        if (typeof point !== 'undefined') {
            const pointClone = clearVmProp(item.point);
            point = removeSVGElements(pointClone);
        }

        if (Array.isArray(points)) {
            points = points.map(clearVmProp);
        }

        return {
            series,
            point,
            points,
            this: _this,
            ...(removeSVGElements(other) as object),
            ...eventProps,
        };
    }

    if (prop && typeof prop === 'function') {
        return prop.toString();
    }

    return prop;
}
