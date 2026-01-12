import type {
    AxisPlotBand,
    AxisPlotLine,
    ChartData,
    ChartSeries,
} from '@gravity-ui/chartkit/gravity-charts';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import {WidgetKind} from 'shared';
import type {WidgetData} from 'ui/libs/DatalensChartkit/types';

import type {ChartAlertProps} from './types';

type OnlyLineChartSeries = Extract<ChartSeries, {type: 'line'}>;
type ChartDataWithOnlyLineSeries = Omit<ChartData, 'series'> & {
    series: {
        data: OnlyLineChartSeries[];
        options?: ChartData['series']['options'];
    };
};
type GravityChartsWidgetDataWithOnlyLineSeries = WidgetData & {
    data: ChartDataWithOnlyLineSeries;
};

export function checkIsGravityWidgetData(
    value: unknown,
): value is GravityChartsWidgetDataWithOnlyLineSeries {
    if (!value || typeof value !== 'object') {
        return false;
    }

    return get(value, 'type') === WidgetKind.GravityCharts;
}

export function getGravityExtremes(args: {key: 'x' | 'y'; series: OnlyLineChartSeries[]}) {
    const {key, series} = args;
    let min: number | undefined;
    let max: number | undefined;

    series.forEach((s) => {
        s.data.forEach((d) => {
            if (typeof d[key] === 'number') {
                min = min === undefined ? d[key] : Math.min(min, d[key]);
            }

            if (typeof d[key] === 'number') {
                max = max === undefined ? d[key] : Math.max(max, d[key]);
            }
        });
    });

    return {min, max};
}

function getPlotBandsGravity(args: {
    alarm: number;
    condition: ChartAlertProps['condition'];
}): AxisPlotBand[] {
    const {alarm, condition} = args;
    const plotBands: AxisPlotBand[] = [];
    let from: AxisPlotBand['from'] | undefined;
    let to: AxisPlotBand['to'] | undefined;

    switch (condition) {
        case 'LT':
        case 'LTE':
            from = -Infinity;
            to = alarm;
            break;
        case 'GT':
        case 'GTE':
            from = alarm;
            to = Infinity;
            break;
    }

    if (from !== undefined && to !== undefined) {
        plotBands.push({
            color: 'var(--g-color-base-danger-light)',
            from,
            layerPlacement: 'after',
            to,
        });
    }

    return plotBands;
}

function getPlotLinesGravity(args: {alarm: number}): AxisPlotLine[] {
    const {alarm} = args;

    return [{value: alarm, color: 'var(--g-color-text-danger)', layerPlacement: 'after'}];
}

export function getAlertsGravityLoadedData(args: {
    loadedData: GravityChartsWidgetDataWithOnlyLineSeries;
    selectedSeriesNames: string[];
    yAxisIndex: number;
    condition?: ChartAlertProps['condition'];
    alarm?: string;
}) {
    const {alarm, condition, loadedData, selectedSeriesNames, yAxisIndex} = args;
    const gravityLoadedData = cloneDeep(loadedData);
    const numericAlarm = parseFloat(alarm || '');

    gravityLoadedData.data.legend = {enabled: false};
    gravityLoadedData.data.chart = {
        ...gravityLoadedData.data.chart,
        zoom: {enabled: false},
    };
    gravityLoadedData.data.title = {text: ''};
    gravityLoadedData.data.xAxis = {
        ...gravityLoadedData.data.xAxis,
        rangeSlider: {enabled: false},
    };
    gravityLoadedData.data.series.data = gravityLoadedData.data.series.data
        .filter((s) => s.yAxis === yAxisIndex)
        .map((s) => {
            const visible = selectedSeriesNames.includes(s.name);
            return {...s, visible, yAxis: 0};
        });
    gravityLoadedData.data.yAxis = [
        {
            ...gravityLoadedData.data?.yAxis?.[yAxisIndex],
            position: 'left',
            title: {text: ''},
        },
    ];

    if (!Number.isNaN(numericAlarm) && condition) {
        const {min, max} = getGravityExtremes({
            key: 'y',
            series: gravityLoadedData.data.series.data,
        });

        if (typeof min === 'number' && typeof max === 'number') {
            let yAxisMin: number | undefined;
            let yAxisMax: number | undefined;
            const alarmPadding = Math.abs(numericAlarm * 0.1);

            if (numericAlarm - alarmPadding < min) {
                yAxisMin = numericAlarm - alarmPadding;
            }

            if (numericAlarm + alarmPadding > max) {
                yAxisMax = numericAlarm + alarmPadding;
            }

            gravityLoadedData.data.yAxis[0].min = yAxisMin;
            gravityLoadedData.data.yAxis[0].max = yAxisMax;
        }

        gravityLoadedData.data.yAxis[0].plotBands = getPlotBandsGravity({
            alarm: numericAlarm,
            condition,
        });
        gravityLoadedData.data.yAxis[0].plotLines = getPlotLinesGravity({
            alarm: numericAlarm,
        });
    }

    return gravityLoadedData;
}
