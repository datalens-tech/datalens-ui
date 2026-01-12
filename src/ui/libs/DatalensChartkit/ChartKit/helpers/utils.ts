import {pickActionParamsFromParams} from '@gravity-ui/dashkit/helpers';
import type {Point} from 'highcharts';
import escape from 'lodash/escape';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import type {StringParams} from '../../../../../shared';
import type {GraphWidget, LoadedWidgetData} from '../../types';
import {ChartKitCustomError} from '../modules/chartkit-custom-error/chartkit-custom-error';

export type PointActionParams = Record<string, string>;

export function getPointActionParams(point: Point): PointActionParams {
    return Object.assign(
        {},
        get(point, 'series.options.custom.actionParams', {}),
        get(point, 'options.custom.actionParams', {}),
    );
}

export function hasMatchedActionParams(
    data: StringParams | undefined,
    actionParams: StringParams = {},
): boolean {
    const matchedParamNames = Object.entries(data ?? {}).filter(([name]) => {
        return name in actionParams && !isEmptyParam(actionParams[name]);
    });

    return (
        matchedParamNames.length > 0 &&
        matchedParamNames.every(([name, value]) => {
            const pointParamValue = String(value);
            const actionParamsValue = actionParams[name];
            if (Array.isArray(actionParamsValue)) {
                return actionParamsValue.some((val) => String(val) === pointParamValue);
            }

            return String(actionParamsValue) === pointParamValue;
        })
    );
}

export function isEmptyParam(paramValue: string | string[]) {
    return Array.isArray(paramValue) ? paramValue.every((p) => p === '') : paramValue === '';
}

export function isPointSelected(point: Point, actionParams: StringParams = {}) {
    return hasMatchedActionParams(getPointActionParams(point), actionParams);
}

export const extractHcTypeFromData = (data?: GraphWidget) => {
    return data?.libraryConfig.chart?.type;
};

export function extractHcTypeFromSeries(series?: Highcharts.Series) {
    return series?.options?.type || series?.chart.options.chart?.type;
}

export function getNormalizedClickActions(data: GraphWidget) {
    if (data.config && 'seriesActions' in data.config) {
        throw new ChartKitCustomError(null, {
            details: `
    Seems you are trying to use unsupported property "config.seriesActions". This property sets according to this type:

    {
        config: {
            events?: {
                click?: {
                    handler: {
                        type: 'setActionParams'
                    };
                    scope: 'point' | 'series';
                };
            };
        };
    }`,
        });
    }

    const actions = data.config?.events?.click;

    if (!actions || isEmpty(actions)) {
        return [];
    }

    return Array.isArray(actions) ? actions : [actions];
}

export function getEscapedActionParams(widgetData: LoadedWidgetData | undefined) {
    const actionParams = pickActionParamsFromParams(get(widgetData, 'unresolvedParams', {}));
    const escapedActionParams: StringParams = {};
    Object.entries(actionParams).forEach(([key, value]) => {
        escapedActionParams[key] = Array.isArray(value)
            ? value.map((v) => escape(String(v)))
            : escape(String(value));
    });

    return escapedActionParams;
}
