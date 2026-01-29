import type {ChartData, LineSeries} from '@gravity-ui/chartkit/gravity-charts';
import chroma from 'chroma-js';
import cloneDeep from 'lodash/cloneDeep';
import max from 'lodash/max';
import merge from 'lodash/merge';
import min from 'lodash/min';
import {PolynomialRegression} from 'ml-regression-polynomial';
import type {ChartStateSettings, SmoothingLineSettings, TrendLineSettings} from 'shared';
import {WidgetKind} from 'shared';
import type {
    ChartContentWidgetData,
    GraphWidget,
    GraphWidgetSeriesOptions,
} from 'ui/libs/DatalensChartkit/types';

function getDarkenColor(originalColor: unknown) {
    const color = chroma(String(originalColor));
    return color.set('lab.l', color.get('lab.l') * 0.8).hex();
}

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

function createTrendSeries({
    chartData,
    settings,
}: {
    chartData: ChartContentWidgetData;
    settings: TrendLineSettings | undefined;
}) {
    const regressionMethod = settings?.method ?? 'linear';

    switch (chartData?.type) {
        case WidgetKind.GravityCharts: {
            const gChartsData = chartData.data as ChartData;
            const series = gChartsData?.series?.data as LineSeries[];
            return series.map((s) => {
                const originalLineData = (s.data ?? []) as PointData[];
                const trendData = generateTrendLine({
                    data: originalLineData,
                    method: regressionMethod,
                });
                const originalSeriesName = s.name;

                return merge({}, cloneDeep(s), {
                    type: 'line',
                    name: `${originalSeriesName}: тренд`,
                    color: settings?.color ?? getDarkenColor(s.color),
                    dashStyle: (settings?.dashStyle ?? 'Dash') as LineSeries['dashStyle'],
                    data: trendData,
                    tooltip: {
                        enabled: false,
                    },
                });
            });
        }
        case WidgetKind.Graph: {
            const graphWidget = chartData as GraphWidget;
            const series =
                'graphs' in graphWidget.data ? graphWidget.data.graphs : graphWidget.data;

            return series.map((s) => {
                const originalLineData = (s.data ?? []) as PointData[];
                const trendData = generateTrendLine({
                    data: originalLineData,
                    method: regressionMethod,
                });
                const originalSeriesName = s.name ?? s.title ?? s.id;

                return {
                    ...cloneDeep(s),
                    type: 'line',
                    name: `${originalSeriesName}: тренд`,
                    color: settings?.color ?? getDarkenColor(s.color),
                    dashStyle: settings?.dashStyle ?? 'Dash',
                    data: trendData,
                };
            });
        }
    }

    return [];
}

function createSmoothingSeries({
    chartData,
    settings,
}: {
    chartData: ChartContentWidgetData;
    settings: SmoothingLineSettings | undefined;
}) {
    const method = settings?.method ?? 'sma';
    const windowSize = settings?.windowSize ?? 3;

    switch (chartData?.type) {
        case WidgetKind.GravityCharts: {
            const gChartsData = chartData.data as ChartData;
            const series = gChartsData?.series?.data as LineSeries[];
            return series.map((s) => {
                const originalLineData = (s.data ?? []) as PointData[];
                const trendData = generateSmoothingLine({
                    data: originalLineData,
                    method,
                    windowSize,
                });
                const originalSeriesName = s.name;

                return merge({}, cloneDeep(s), {
                    type: 'line',
                    name: `${originalSeriesName}: сглаживание`,
                    color: settings?.color ?? getDarkenColor(s.color),
                    dashStyle: settings?.dashStyle as LineSeries['dashStyle'],
                    data: trendData,
                    tooltip: {
                        enabled: false,
                    },
                });
            });
        }
        case WidgetKind.Graph: {
            const graphWidget = chartData as GraphWidget;
            const series =
                'graphs' in graphWidget.data ? graphWidget.data.graphs : graphWidget.data;

            return series.map((s) => {
                const originalLineData = (s.data ?? []) as PointData[];
                const trendData = generateSmoothingLine({
                    data: originalLineData,
                    method,
                    windowSize,
                });
                const originalSeriesName = s.name ?? s.title ?? s.id;
                return {
                    ...cloneDeep(s),
                    type: 'line',
                    name: `${originalSeriesName}: сглаживание`,
                    color: settings?.color ?? getDarkenColor(s.color),
                    dashStyle: settings?.dashStyle,
                    data: trendData,
                };
            });
        }
    }

    return [];
}

export function addChartAnalyticsSeries({
    chartStateData,
    chartData,
}: {
    chartStateData: ChartStateSettings;
    chartData: ChartContentWidgetData;
}) {
    const newChartSeries = [];
    let shouldHideOriginalLines = false;
    if (chartStateData?.trends?.enabled) {
        newChartSeries.push(
            ...createTrendSeries({
                chartData,
                settings: chartStateData.trends.settings,
            }),
        );
    }

    if (chartStateData?.smoothing?.enabled) {
        newChartSeries.push(
            ...createSmoothingSeries({
                chartData,
                settings: chartStateData.smoothing.settings,
            }),
        );
        shouldHideOriginalLines = true;
    }

    switch (chartData?.type) {
        case WidgetKind.GravityCharts: {
            const gChartData = chartData.data as ChartData;
            if (shouldHideOriginalLines) {
                gChartData.series.data.forEach((s) => {
                    s.visible = false;
                });
            }
            gChartData.series.data.push(...(newChartSeries as LineSeries[]));
            break;
        }
        case WidgetKind.Graph: {
            const graphWidget = chartData as GraphWidget;
            let series;
            if ('graphs' in graphWidget.data) {
                series = graphWidget.data.graphs;
            } else {
                series = graphWidget.data;
            }
            if (shouldHideOriginalLines) {
                series.forEach((s) => {
                    s.visible = false;
                });
            }
            series.push(...(newChartSeries as GraphWidgetSeriesOptions[]));

            break;
        }
    }

    return chartData;
}
