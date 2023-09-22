import type {Highcharts} from '@gravity-ui/chartkit/highcharts';
import {transformParamsToActionParams} from '@gravity-ui/dashkit';
import {wrap} from 'highcharts';
import get from 'lodash/get';
import has from 'lodash/has';
import merge from 'lodash/merge';
import set from 'lodash/set';
import type {StringParams} from 'shared';

import type {GraphWidget, HighchartsSeriesAction} from '../../types';
import type {ChartKitAdapterProps} from '../types';

type ActionClickScope = NonNullable<HighchartsSeriesAction['scope']>;

const Opacity = {
    SELECTED: '1',
    UNSELECTED: '0.5',
};

export const extractHcTypeFromData = (data?: GraphWidget) => {
    return data?.libraryConfig.chart?.type;
};

const extractHcTypeFromPoint = (point: Highcharts.Point) => {
    return point.series.chart.options.chart?.type;
};

const isStringParam = (data: unknown): data is StringParams => {
    if (typeof data !== 'object' || Array.isArray(data) || data === null) {
        return false;
    }

    const entries = Object.entries(data);

    if (entries.length !== 1) {
        return false;
    }

    const value = entries[0][1];

    return Array.isArray(value) || typeof value === 'string';
};

const applyParamToParams = (args: {
    params: StringParams;
    key: string;
    value: string;
    selected: boolean;
}) => {
    const {params, key, value, selected} = args;
    const isArray = Array.isArray(params[key]);
    const isString = typeof params[key] === 'string';

    if (selected && isArray && !params[key].includes(value)) {
        (params[key] as string[]).push(value);
    } else if (!selected && isArray && params[key].includes(value)) {
        params[key] = (params[key] as string[]).filter((iteratedValue) => iteratedValue !== value);
    } else if (selected && isString && params[key] !== value) {
        params[key] = [params[key] as string, value];
    } else if (!selected && isString && params[key] === value) {
        params[key] = [];
    }
};

export const setPointActionParamToParams = (args: {
    actionParam: unknown;
    params: StringParams;
    selected: boolean;
}) => {
    const {actionParam, params, selected} = args;

    if (!isStringParam(actionParam)) {
        return;
    }

    const [key, values] = Object.entries(actionParam)[0];

    if (!params[key]) {
        params[key] = [];
    }

    if (Array.isArray(values)) {
        values.forEach((value) => applyParamToParams({params, key, value, selected}));
    } else {
        applyParamToParams({params, key, value: values, selected});
    }
};

const pointsToParams = (points: Highcharts.Point[]) => {
    return points.reduce<StringParams>((params, point) => {
        const actionParam = get(point, 'options.custom.actionParam');
        setPointActionParamToParams({
            actionParam,
            params,
            selected: point.selected,
        });

        return params;
    }, {});
};

const seriesToParams = (series: Highcharts.Series[]) => {
    return series.reduce<StringParams>((params, seriesItem) => {
        const points = seriesItem.getPointsCollection();
        const actionParams = points.map((point) => get(point, 'options.custom.actionParam'));

        if (!Array.isArray(actionParams)) {
            return params;
        }

        actionParams.forEach((actionParam: unknown) => {
            setPointActionParamToParams({
                actionParam,
                params,
                selected: seriesItem.selected,
            });
        });

        return params;
    }, {});
};

const setPointOpacity = (point: Highcharts.Point) => {
    const type = extractHcTypeFromPoint(point);
    const opacity = point.selected ? Opacity.SELECTED : Opacity.UNSELECTED;

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

const handleChartLoadingForActionParams = (args: {
    clickScope: ActionClickScope;
    series: Highcharts.Series[];
}) => {
    const {clickScope, series} = args;

    switch (clickScope) {
        case 'point': {
            const allPoints = series.map((s) => s.getPointsCollection()).flatMap((s) => s);
            const hasSelectedPoints = allPoints.some((p) => p.selected);

            if (hasSelectedPoints) {
                allPoints.forEach(setPointOpacity);
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

const handleSeriesClickForActionParams = (args: {
    chart: Highcharts.Chart;
    clickScope: ActionClickScope;
    event: Highcharts.SeriesClickEventObject;
    onChange?: ChartKitAdapterProps['onChange'];
}) => {
    const {chart, clickScope, event, onChange} = args;
    let actionParams: StringParams = {};

    switch (clickScope) {
        case 'point': {
            event.point.select(undefined, event.metaKey);
            const allPoints = chart.series.map((s) => s.getPointsCollection()).flatMap((s) => s);
            allPoints.forEach(setPointOpacity);
            const params = pointsToParams(allPoints);
            actionParams = transformParamsToActionParams(params);

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
            actionParams = transformParamsToActionParams(params);

            break;
        }
    }

    onChange?.(
        {
            type: 'PARAMS_CHANGED',
            data: {params: {...actionParams}},
        },
        {forceUpdate: true},
        true,
        true,
    );
};

export const fixPieTotals = (args: {data: GraphWidget}) => {
    const {data} = args;
    const pathToSeriesEvents = 'libraryConfig.plotOptions.series.events';

    if (!has(data, pathToSeriesEvents)) {
        set(data, pathToSeriesEvents, {});
    }

    wrap(get(data, pathToSeriesEvents), 'afterRender', function (this: Highcharts.Series) {
        // @ts-ignore
        delete this.total;
    });
};

export const applySetActionParamsEvents = (args: {
    action: HighchartsSeriesAction;
    data: GraphWidget;
    onChange?: ChartKitAdapterProps['onChange'];
}) => {
    const {action, data, onChange} = args;
    const clickScope: ActionClickScope = get(action, 'scope', 'point');
    const chartType = extractHcTypeFromData(data);
    const pathToChartEvents = 'libraryConfig.chart.events';
    const pathToSeriesEvents = 'libraryConfig.plotOptions.series.events';
    const pathToSeriesStates = 'libraryConfig.plotOptions.series.states';
    const pathToScatterMarkerStates = 'libraryConfig.plotOptions.scatter.marker.states';

    if (!has(data, pathToChartEvents)) {
        set(data, pathToChartEvents, {});
    }

    if (!has(data, pathToSeriesEvents)) {
        set(data, pathToSeriesEvents, {});
    }

    if (!has(data, pathToSeriesStates)) {
        set(data, pathToSeriesStates, {});
    }

    if (chartType === 'scatter' && !has(data, pathToScatterMarkerStates)) {
        set(data, pathToScatterMarkerStates, {});
    }

    wrap(
        get(data, pathToChartEvents),
        'load',
        function (
            this: Highcharts.Chart,
            proceed: Highcharts.ChartLoadCallbackFunction,
            event: Event,
        ) {
            handleChartLoadingForActionParams({series: this.series, clickScope});
            proceed?.apply(this, [event]);
        },
    );

    wrap(
        get(data, pathToSeriesEvents),
        'click',
        function (
            this: Highcharts.Series,
            proceed: Highcharts.SeriesClickCallbackFunction,
            event: Highcharts.SeriesClickEventObject,
        ) {
            handleSeriesClickForActionParams({chart: this.chart, clickScope, event, onChange});
            proceed?.apply(this, [event]);
        },
    );

    merge(get(data, pathToSeriesStates), {
        select: {
            // https://www.highcharts.com/forum/viewtopic.php?t=39268
            color: undefined,
            borderColor: undefined,
        },
    });

    if (chartType === 'scatter') {
        merge(get(data, pathToScatterMarkerStates), {
            select: {
                lineWidth: 0,
                radius: 7,
                fillColor: null,
            },
        });
    }
};
