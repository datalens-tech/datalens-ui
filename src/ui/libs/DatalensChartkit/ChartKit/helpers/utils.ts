import type {Point} from 'highcharts';
import get from 'lodash/get';

import {GraphWidget} from '../../types';

export type ActionParamsValue = string | number | boolean;
export type ActionParams = Record<string, ActionParamsValue | ActionParamsValue[]>;

export type PointActionParams = Record<string, string>;

export function isPointSelected(point: Point, actionParams: ActionParams = {}) {
    const pointActionParams: PointActionParams = get(point, 'options.custom.actionParams', {});

    const result = Object.entries(pointActionParams).reduce<boolean | undefined>(
        (acc, [name, value]) => {
            if (acc === false) {
                return false;
            }

            if (name in actionParams) {
                const pointParamValue = String(value);
                const actionParamsValue = actionParams[name];
                if (Array.isArray(actionParamsValue)) {
                    return actionParamsValue.some((val) => String(val) === pointParamValue);
                }

                return String(actionParamsValue) === pointParamValue;
            }

            return acc;
        },
        undefined,
    );

    return Boolean(result);
}

export const extractHcTypeFromData = (data?: GraphWidget) => {
    return data?.libraryConfig.chart?.type;
};

export function extractHcTypeFromSeries(series?: Highcharts.Series) {
    return series?.chart.options.chart?.type;
}
