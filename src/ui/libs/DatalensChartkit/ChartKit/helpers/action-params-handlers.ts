import type {Highcharts} from '@gravity-ui/chartkit/highcharts';
import {transformParamsToActionParams} from '@gravity-ui/dashkit';
import type {Point, PointOptionsObject} from 'highcharts';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import merge from 'lodash/merge';
import uniq from 'lodash/uniq';

import type {GraphWidgetEventScope, StringParams} from '../../../../../shared';
import type {ChartKitAdapterProps} from '../types';

import {
    extractHcTypeFromSeries,
    getPointActionParams,
    isEmptyParam,
    isPointSelected,
} from './utils';

const Opacity = {
    SELECTED: '1',
    UNSELECTED: '0.5',
};

function setPointSelectState(point: Point, selected: boolean) {
    const type = extractHcTypeFromSeries(point.series);
    const opacity = selected ? Opacity.SELECTED : Opacity.UNSELECTED;

    switch (type) {
        case 'scatter': {
            const prevMarkerOptions = get(point, 'marker');
            const markerOptions = merge({}, prevMarkerOptions, {
                states: {normal: {opacity}},
            });
            point.update(
                {
                    marker: markerOptions,
                } as unknown as PointOptionsObject,
                false,
            );
            break;
        }
        case 'line':
        case 'area': {
            point.update(
                {
                    marker: {
                        enabled: selected,
                        fillOpacity: opacity,
                        states: {normal: {opacity}},
                    },
                } as unknown as PointOptionsObject,
                false,
            );
            break;
        }
        default: {
            point.update({opacity} as unknown as PointOptionsObject, false);
        }
    }
}

function setSeriesSelectState(series: Highcharts.Series, selected: boolean) {
    const type = extractHcTypeFromSeries(series);
    const opacity = selected ? Opacity.SELECTED : Opacity.UNSELECTED;

    switch (type) {
        case 'area':
        case 'line': {
            series.update({opacity}, false);
            break;
        }
        default: {
            break;
        }
    }
}

export function addParams(params: StringParams, addition: StringParams = {}) {
    const result = cloneDeep(params);

    return Object.entries(addition).reduce((acc, [key, val]) => {
        if (!(key in acc)) {
            acc[key] = [];
        }

        if (!Array.isArray(acc[key])) {
            acc[key] = [acc[key] as string];
        }

        if ((acc[key] as string[]).every(isEmptyParam)) {
            acc[key] = [];
        }

        const value = Array.isArray(val) ? val.map(String) : String(val);
        acc[key] = uniq((acc[key] as string[]).concat(value));
        return acc;
    }, result);
}

export function subtractParameters(params: StringParams, sub: StringParams = {}) {
    const result = cloneDeep(params);
    return Object.entries(sub).reduce((acc, [key, val]) => {
        const paramValue = acc[key];
        if (Array.isArray(paramValue)) {
            const exclude = Array.isArray(val) ? val.map(String) : [String(val)];
            acc[key] = paramValue.filter((item) => !exclude.includes(item));
        } else {
            delete acc[key];
        }

        return acc;
    }, result);
}

const applyParamToParams = (args: {
    params: StringParams;
    key: string;
    value: string;
    selected: boolean;
}) => {
    const {params, key, value, selected} = args;
    const isArray = Array.isArray(params[key]);
    const isString = typeof params[key] === 'string';

    if (selected) {
        if (isArray && !params[key].includes(value)) {
            (params[key] as string[]).push(value);
        } else if (isString && params[key] !== value) {
            params[key] = [params[key] as string, value];
        }
    } else if (isArray && params[key].includes(value)) {
        params[key] = (params[key] as string[]).filter((iteratedValue) => iteratedValue !== value);
    } else if (isString && params[key] === value) {
        params[key] = [];
    }
};

export const setPointActionParamToParams = (args: {
    actionParams: unknown;
    params: StringParams;
    selected: boolean;
}) => {
    const {actionParams, params, selected} = args;

    if (!actionParams || typeof actionParams !== 'object') {
        return;
    }

    Object.entries(actionParams).forEach(([key, values]) => {
        if (!params[key]) {
            params[key] = [];
        }

        if (Array.isArray(values)) {
            values.forEach((value) => applyParamToParams({params, key, value, selected}));
        } else {
            applyParamToParams({params, key, value: values, selected});
        }
    });
};

export const handleChartLoadingForActionParams = (args: {
    clickScope: GraphWidgetEventScope;
    series: Highcharts.Series[];
    actionParams?: StringParams;
}) => {
    const {clickScope, series, actionParams = {}} = args;

    if (!Object.keys(actionParams).length) {
        return;
    }

    switch (clickScope) {
        case 'point': {
            const chartPoints = series.reduce(
                (acc, s) => acc.concat(s.getPointsCollection()),
                [] as Point[],
            );

            const hasSomePointSelected = chartPoints.some((p) => isPointSelected(p, actionParams));
            if (hasSomePointSelected) {
                series.forEach((s) => {
                    const hasAnySelectedPoints = s.getPointsCollection().reduce((acc, p) => {
                        const pointSelected = isPointSelected(p, actionParams);
                        setPointSelectState(p, pointSelected);
                        return acc || pointSelected;
                    }, false);
                    setSeriesSelectState(s, hasAnySelectedPoints);
                });
                series[0]?.chart.redraw();
            }

            break;
        }
    }
};

export function handleSeriesClickForActionParams(args: {
    chart: Highcharts.Chart;
    point?: Highcharts.Point;
    clickScope: GraphWidgetEventScope;
    event: {metaKey?: boolean};
    onChange?: ChartKitAdapterProps['onChange'];
    actionParams: StringParams;
}) {
    const {chart, clickScope, event, point, onChange, actionParams: prevActionParams} = args;
    const multiSelect = Boolean(event.metaKey);
    let newActionParams: StringParams = prevActionParams;

    switch (clickScope) {
        case 'point': {
            if (!point) {
                return;
            }

            const currentPoint = point;
            const currentPointParams = getPointActionParams(currentPoint);
            const chartPoints = chart.series.reduce(
                (acc, s) => acc.concat(s.getPointsCollection()),
                [] as Point[],
            );
            const hasSomePointSelected = chartPoints.some((p) =>
                isPointSelected(p, prevActionParams),
            );

            if (hasSomePointSelected) {
                if (isPointSelected(currentPoint, prevActionParams)) {
                    chartPoints.forEach((p) => {
                        if (isPointSelected(p, currentPointParams)) {
                            setPointSelectState(p, false);
                        }
                    });

                    if (multiSelect) {
                        newActionParams = subtractParameters(newActionParams, currentPointParams);
                        chartPoints.forEach((p) => {
                            if (isPointSelected(p, newActionParams)) {
                                const pointParams = getPointActionParams(p);
                                newActionParams = addParams(newActionParams, pointParams);
                            }
                        });
                    } else {
                        newActionParams = {};
                    }
                } else {
                    if (!multiSelect) {
                        // should remove the selection from the previously selected points
                        chartPoints.forEach((p) => {
                            if (isPointSelected(p, prevActionParams)) {
                                const pointParams = getPointActionParams(p);
                                newActionParams = subtractParameters(newActionParams, pointParams);

                                setPointSelectState(p, false);
                            }
                        });
                    }

                    setPointSelectState(currentPoint, true);
                    newActionParams = addParams(newActionParams, currentPointParams);
                }
            } else {
                newActionParams = addParams(newActionParams, currentPointParams);
                chartPoints.forEach((p) => {
                    if (!isPointSelected(p, newActionParams)) {
                        setPointSelectState(p, false);
                    }
                });
            }

            break;
        }
    }

    if (isEqual(prevActionParams, newActionParams)) {
        return;
    }

    const params = transformParamsToActionParams(newActionParams as StringParams);
    onChange?.(
        {
            type: 'PARAMS_CHANGED',
            data: {params},
        },
        {forceUpdate: true},
        true,
        true,
    );
}
