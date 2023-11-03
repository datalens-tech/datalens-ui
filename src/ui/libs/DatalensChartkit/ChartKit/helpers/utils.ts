import type {Point} from 'highcharts';
import get from 'lodash/get';
import {GraphWidget} from "ui/libs/DatalensChartkit/types";

export type ActionParams = Record<string, string | string[]>;

export type PointActionParams = Record<string, string>;

export function isPointSelected(point: Point, actionParams: ActionParams = {}) {
    const pointActionParams: PointActionParams = get(point, 'options.custom.actionParams', {});

    return Object.entries(pointActionParams).every(([name, value]) => {
        if (name in actionParams) {
            const actionParamsValue = actionParams[name];
            if (Array.isArray(actionParamsValue)) {
                return actionParamsValue.includes(value);
            }

            return actionParamsValue === value;
        }

        return false;
    });
}

export const extractHcTypeFromData = (data?: GraphWidget) => {
    return data?.libraryConfig.chart?.type;
};

export function extractHcTypeFromPoint(point: Highcharts.Point) {
    return point.series.chart.options.chart?.type;
}
