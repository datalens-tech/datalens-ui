import type {Highcharts} from '@gravity-ui/chartkit/highcharts';
import {transformParamsToActionParams} from '@gravity-ui/dashkit';
import type {Point} from 'highcharts';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import uniq from 'lodash/uniq';
import type {GraphWidgetEventScope, StringParams} from 'shared';

import type {ChartKitAdapterProps} from '../types';

import {ActionParams, extractHcTypeFromPoint, isPointSelected} from './utils';

const Opacity = {
    SELECTED: '1',
    UNSELECTED: '0.5',
};

const setPointOpacity = (point: Highcharts.Point, opacity: string) => {
    const type = extractHcTypeFromPoint(point);

    if (type === 'scatter') {
        // @ts-expect-error
        point.update({marker: {states: {normal: {opacity}}}});
    } else {
        point.update({opacity});
    }
};

const setSeriesOpacity = (seriesItem: Highcharts.Series) => {
    const opacity = seriesItem.selected ? Opacity.SELECTED : Opacity.UNSELECTED;
    seriesItem.update({opacity, selected: seriesItem.selected});
};

function selectPoint(point: Point) {
    point.select(true);
    setPointOpacity(point, Opacity.SELECTED);
}

function unselectPoint(point: Point) {
    point.select(false);
    setPointOpacity(point, Opacity.UNSELECTED);
}

function mergeParams(params: ActionParams, addition: ActionParams = {}) {
    const result = cloneDeep(params);
    return Object.entries(addition).reduce((acc, [key, value]) => {
        if (!acc[key]) {
            acc[key] = [];
        }

        acc[key] = uniq(acc[key].concat(value as string));
        return acc;
    }, result);
}

function subtractParameters(params: ActionParams, sub: ActionParams = {}) {
    const result = cloneDeep(params);
    return Object.entries(sub).reduce((acc, [key, value]) => {
        const paramValue = acc[key];
        if (Array.isArray(paramValue)) {
            const exclude = Array.isArray(value) ? value : [value];
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

function seriesToParams(series: Highcharts.Series[]) {
    return series.reduce<StringParams>((params, seriesItem) => {
        const points = seriesItem.getPointsCollection();
        const actionParams = points.map((point) => get(point, 'options.custom.actionParam'));

        if (!Array.isArray(actionParams)) {
            return params;
        }

        actionParams.forEach((actionParam: unknown) => {
            setPointActionParamToParams({
                actionParams: actionParam,
                params,
                selected: seriesItem.selected,
            });
        });

        return params;
    }, {});
}

export const handleChartLoadingForActionParams = (args: {
    clickScope: GraphWidgetEventScope;
    series: Highcharts.Series[];
    actionParams?: ActionParams;
}) => {
    const {clickScope, series, actionParams = {}} = args;

    switch (clickScope) {
        case 'point': {
            const chartPoints = series.reduce(
                (acc, s) => acc.concat(s.getPointsCollection()),
                [] as Point[],
            );

            const hasSomePointSelected = chartPoints.some((p) => isPointSelected(p, actionParams));
            if (hasSomePointSelected) {
                chartPoints.forEach((p) => {
                    if (!isPointSelected(p, actionParams)) {
                        unselectPoint(p);
                    }
                });
            }

            break;
        }
        case 'series': {
            const hasSelectedSeries = series.some((s) => s.selected);

            if (hasSelectedSeries) {
                series.forEach(setSeriesOpacity);
            }

            break;
        }
    }
};

export function handleSeriesClickForActionParams(args: {
    chart: Highcharts.Chart;
    clickScope: GraphWidgetEventScope;
    event: Highcharts.SeriesClickEventObject;
    onChange?: ChartKitAdapterProps['onChange'];
    actionParams: ActionParams;
}) {
    const {chart, clickScope, event, onChange, actionParams: prevActionParams} = args;
    const multiSelect = Boolean(event.metaKey);
    let newActionParams: StringParams = prevActionParams;

    switch (clickScope) {
        case 'point': {
            const currentPoint = event.point;
            const currentPointParams = get(currentPoint, 'options.custom.actionParams', {});
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
                            unselectPoint(p);
                        }
                    });

                    newActionParams = subtractParameters(newActionParams, currentPointParams);

                    if (multiSelect) {
                        chartPoints.forEach((p) => {
                            if (isPointSelected(p, newActionParams)) {
                                const pointParams = get(p, 'options.custom.actionParams', {});
                                newActionParams = mergeParams(newActionParams, pointParams);
                            }
                        });
                    }
                } else {
                    if (!multiSelect) {
                        // should remove the selection from the previously selected points
                        chartPoints.forEach((p) => {
                            if (isPointSelected(p, prevActionParams)) {
                                const pointParams = get(p, 'options.custom.actionParams', {});
                                newActionParams = subtractParameters(newActionParams, pointParams);

                                unselectPoint(p);
                            }
                        });
                    }

                    selectPoint(currentPoint);
                    newActionParams = mergeParams(newActionParams, currentPointParams);
                }
            } else {
                newActionParams = mergeParams(newActionParams, currentPointParams);
                chartPoints.forEach((p) => {
                    if (!isPointSelected(p, newActionParams)) {
                        unselectPoint(p);
                    }
                });
            }

            break;
        }
        case 'series': {
            event.point.series.select();

            if (!event.metaKey) {
                chart.series
                    .filter((s) => s.name !== event.point.series.name)
                    .forEach((s) => {
                        if (s.selected) {
                            s.select();
                        }
                    });
            }

            chart.series.forEach(setSeriesOpacity);
            const params = seriesToParams(chart.series);
            newActionParams = transformParamsToActionParams(params);

            break;
        }
    }

    onChange?.(
        {
            type: 'PARAMS_CHANGED',
            data: {params: {...transformParamsToActionParams(newActionParams)}},
        },
        {forceUpdate: true},
        true,
        true,
    );
}
