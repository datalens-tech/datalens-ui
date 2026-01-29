import type {ChartData, LineSeries} from '@gravity-ui/chartkit/gravity-charts';
import chroma from 'chroma-js';
import {cloneDeep} from 'lodash';
import max from 'lodash/max';
import merge from 'lodash/merge';
import min from 'lodash/min';
import {PolynomialRegression} from 'ml-regression-polynomial';
import type {SmoothingLineSettings, TrendLineSettings} from 'shared';
import {WidgetKind} from 'shared';
import type {ChartContentWidgetData, GraphWidget} from 'ui/libs/DatalensChartkit/types';

type PointData = {x: number; y: number};

function generateTrendLine({
    data,
    method,
}: {
    data: PointData[];
    method: TrendLineSettings['method'];
}) {
    const trendLine = [];
    let numPoints;

    const xValues = data.map((point) => point.x);
    const yValues = data.map((point) => point.y);
    let regression: PolynomialRegression;
    switch (method) {
        case 'quadratic': {
            regression = new PolynomialRegression(xValues, yValues, 2);
            numPoints = 100;
            break;
        }
        case 'cubic': {
            regression = new PolynomialRegression(xValues, yValues, 3);
            numPoints = 100;
            break;
        }
        case 'linear':
        default: {
            regression = new PolynomialRegression(xValues, yValues, 1);
            numPoints = 2;
            break;
        }
    }

    const xMin = min(xValues);
    const xMax = max(xValues);

    if (typeof xMin === 'undefined' || typeof xMax === 'undefined') {
        return [];
    }

    const step = (xMax - xMin) / (numPoints - 1);

    for (let i = 0; i < numPoints; i++) {
        const x = xMin + step * i;
        const y = regression.predict(x);
        trendLine.push({x, y});
    }

    return trendLine;
}

function sma({data, windowSize}: {data: PointData[]; windowSize: number}) {
    const result: PointData[] = [];
    let sum = 0;
    let count = 0;

    for (let i = 0; i < data.length; i++) {
        sum += data[i].y;
        count++;

        if (count > windowSize) {
            sum -= data[i - windowSize].y;
            count--;
        }

        result.push({
            x: data[i].x,
            y: sum / count,
        });
    }

    return result;
}

function generateSmoothingLine({
    data,
    windowSize = 3,
    method,
}: {
    data: PointData[];
    windowSize: SmoothingLineSettings['windowSize'];
    method: SmoothingLineSettings['method'];
}) {
    switch (method) {
        case 'sma':
        default: {
            return sma({data, windowSize});
        }
    }
}

export function addTrendLine({
    chartData: originalChartData,
    settings,
}: {
    chartData: ChartContentWidgetData;
    settings: TrendLineSettings | undefined;
}) {
    const regressionMethod = settings?.method ?? 'linear';
    const chartData: ChartContentWidgetData = cloneDeep(originalChartData);

    switch (chartData?.type) {
        case WidgetKind.GravityCharts: {
            const gChartsData = chartData.data as ChartData;
            const series = gChartsData?.series?.data as LineSeries[];
            const trendLines = series.map((s) => {
                const originalLineData = (s.data ?? []) as PointData[];
                const trendData = generateTrendLine({
                    data: originalLineData,
                    method: regressionMethod,
                });
                const originalSeriesName = s.name;

                const trendLine: LineSeries = {
                    type: 'line',
                    name: `${originalSeriesName}: тренд`,
                    color: settings?.color ?? chroma(String(s.color)).darken(1.2).hex(),
                    dashStyle: (settings?.dashStyle ?? 'Dash') as LineSeries['dashStyle'],
                    data: trendData,
                    legend: {
                        symbol: {
                            width: 36,
                        },
                    },
                };

                return trendLine;
            });

            series.push(...trendLines);
            merge(gChartsData, {legend: {enabled: true}});
            break;
        }
        case WidgetKind.Graph: {
            const graphWidget = chartData as GraphWidget;
            const series =
                'graphs' in graphWidget.data ? graphWidget.data.graphs : graphWidget.data;

            const trendLines = series.map((s) => {
                const originalLineData = (s.data ?? []) as PointData[];
                const trendData = generateTrendLine({
                    data: originalLineData,
                    method: regressionMethod,
                });
                const originalSeriesName = s.name ?? s.title ?? s.id;

                return {
                    type: 'line',
                    name: `${originalSeriesName}: тренд`,
                    color: settings?.color ?? chroma(String(s.color)).darken(1.2).hex(),
                    dashStyle: settings?.dashStyle ?? 'Dash',
                    data: trendData,
                };
            });

            series.push(...trendLines);
            break;
        }
    }

    return chartData;
}

export function addSmoothingLine({
    chartData: originalChartData,
    settings,
}: {
    chartData: ChartContentWidgetData;
    settings: SmoothingLineSettings | undefined;
}) {
    const method = settings?.method ?? 'sma';
    const windowSize = settings?.windowSize ?? 3;

    const chartData: ChartContentWidgetData = cloneDeep(originalChartData);
    switch (chartData?.type) {
        case WidgetKind.GravityCharts: {
            const gChartsData = chartData.data as ChartData;
            const series = gChartsData?.series?.data as LineSeries[];
            const newSeries = series.map((s) => {
                const originalLineData = (s.data ?? []) as PointData[];
                const trendData = generateSmoothingLine({
                    data: originalLineData,
                    method,
                    windowSize,
                });
                const originalSeriesName = s.name;

                const trendLine: LineSeries = {
                    type: 'line',
                    name: `${originalSeriesName}: сглаживание`,
                    color: settings?.color ?? chroma(String(s.color)).darken(1.2).hex(),
                    dashStyle: settings?.dashStyle as LineSeries['dashStyle'],
                    data: trendData,
                    legend: {
                        symbol: {
                            width: 36,
                        },
                    },
                };

                return trendLine;
            });

            series.push(...newSeries);
            merge(gChartsData, {legend: {enabled: true}});
            break;
        }
        case WidgetKind.Graph: {
            const graphWidget = chartData as GraphWidget;
            const series =
                'graphs' in graphWidget.data ? graphWidget.data.graphs : graphWidget.data;

            const newSeries = series.map((s) => {
                const originalLineData = (s.data ?? []) as PointData[];
                const trendData = generateSmoothingLine({
                    data: originalLineData,
                    method,
                    windowSize,
                });
                const originalSeriesName = s.name ?? s.title ?? s.id;
                return {
                    type: 'line',
                    name: `${originalSeriesName}: сглаживание`,
                    color: settings?.color ?? chroma(String(s.color)).darken(1.2).hex(),
                    dashStyle: settings?.dashStyle,
                    data: trendData,
                };
            });

            series.push(...newSeries);
            break;
        }
    }

    return chartData;
}
