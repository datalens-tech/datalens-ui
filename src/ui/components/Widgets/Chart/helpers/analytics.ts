import type {ChartData, LineSeries} from '@gravity-ui/chartkit/gravity-charts';
import chroma from 'chroma-js';
import cloneDeep from 'lodash/cloneDeep';
import {PolynomialRegression} from 'ml-regression-polynomial';
import type {ChartStateSettings, SmoothingLineSettings, TrendLineSettings} from 'shared';
import {WidgetKind} from 'shared';
import {DEFAULT_SMOOTHING, DEFAULT_TREND_SETTINGS} from 'shared/constants/chart-modeling';
import type {
    ChartContentWidgetData,
    GraphWidget,
    GraphWidgetSeriesOptions,
} from 'ui/libs/DatalensChartkit/types';

function getDarkenColor(originalColor: unknown, value = 0.8) {
    const color = chroma(String(originalColor));
    return color.set('lab.l', color.get('lab.l') * value).hex();
}

function getComplementary(originalColor: unknown) {
    return chroma(String(originalColor)).set('hsl.h', '+180').hex();
}

type PointData = {x: number; y: number};

function generateTrendLine({
    data,
    method,
}: {
    data: PointData[];
    method: TrendLineSettings['method'];
}) {
    const trendLine: PointData[] = [];

    const xValues = data.map((point) => point.x);
    const yValues = data.map((point) => point.y);
    let regression: PolynomialRegression;
    switch (method) {
        case 'quadratic': {
            regression = new PolynomialRegression(xValues, yValues, 2);
            break;
        }
        case 'cubic': {
            regression = new PolynomialRegression(xValues, yValues, 3);
            break;
        }
        case 'linear':
        default: {
            regression = new PolynomialRegression(xValues, yValues, 1);
            break;
        }
    }

    data.forEach((d) => {
        const y = regression.predict(d.x);
        trendLine.push({x: d.x, y});
    });

    return trendLine;
}

function sma({data, windowSize}: {data: PointData[]; windowSize: number}) {
    const result = [];
    let sum = 0;

    for (let i = 0; i < data.length; i++) {
        sum += data[i].y;

        if (i < windowSize - 1) {
            result.push({...data[i]});
        } else {
            if (i >= windowSize) {
                sum -= data[i - windowSize].y;
            }
            result.push({
                x: data[i].x,
                y: sum / windowSize,
            });
        }
    }

    return result;
}

function generateSmoothingLine({
    data,
    windowSize,
    method,
}: {
    data: PointData[];
    windowSize: number;
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
    const regressionMethod = settings?.method ?? DEFAULT_TREND_SETTINGS.method;
    const lineWidth = settings?.lineWidth ?? DEFAULT_TREND_SETTINGS.lineWidth;
    const colorMode = settings?.colorMode ?? DEFAULT_TREND_SETTINGS.colorMode;
    let dashStyle = settings?.dashStyle;
    if (dashStyle === 'auto') {
        dashStyle = undefined;
    }

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
                const color =
                    colorMode === 'similar' ? getDarkenColor(s.color) : getComplementary(s.color);

                const newSeries = {
                    ...cloneDeep(s),
                    type: 'line',
                    name: `${originalSeriesName}: тренд`,
                    color,
                    dashStyle: (dashStyle ?? 'Dash') as LineSeries['dashStyle'],
                    data: trendData,
                    lineWidth,
                };

                if (!settings?.linked) {
                    if (newSeries.legend?.groupId) {
                        newSeries.legend.groupId += 'smoothing';
                    }
                }

                return newSeries;
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
                const name = `${originalSeriesName}: тренд`;
                const color =
                    colorMode === 'similar' ? getDarkenColor(s.color) : getComplementary(s.color);

                return {
                    ...cloneDeep(s),
                    id: name,
                    type: 'line',
                    name: name,
                    color,
                    dashStyle: dashStyle ?? 'Dash',
                    data: trendData,
                    lineWidth,
                    linkedTo: settings?.linked ? s.id : undefined,
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
    const windowSize = Number(settings?.windowSize ?? DEFAULT_SMOOTHING.windowSize);
    const colorMode = settings?.colorMode ?? DEFAULT_SMOOTHING.colorMode;
    const lineWidth = settings?.lineWidth ?? DEFAULT_SMOOTHING.lineWidth;
    let dashStyle = settings?.dashStyle;
    if (dashStyle === 'auto') {
        dashStyle = undefined;
    }

    switch (chartData?.type) {
        case WidgetKind.GravityCharts: {
            const gChartsData = chartData.data as ChartData;
            const series = gChartsData?.series?.data as LineSeries[];
            return series.map((s) => {
                const originalLineData = (s.data ?? []) as PointData[];
                const seriesData = generateSmoothingLine({
                    data: originalLineData,
                    method,
                    windowSize,
                });
                const originalSeriesName = s.name;
                const color =
                    colorMode === 'similar' ? getDarkenColor(s.color) : getComplementary(s.color);

                const newSeries = {
                    ...cloneDeep(s),
                    type: 'line',
                    name: `${originalSeriesName}: сглаживание`,
                    color,
                    dashStyle: (dashStyle ?? s.dashStyle) as LineSeries['dashStyle'],
                    data: seriesData,
                    lineWidth,
                };

                if (!settings?.linked) {
                    if (newSeries.legend?.groupId) {
                        newSeries.legend.groupId += 'smoothing';
                    }
                }

                return newSeries;
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
                const name = `${originalSeriesName}: сглаживание`;
                const color =
                    colorMode === 'similar' ? getDarkenColor(s.color) : getComplementary(s.color);

                return {
                    ...cloneDeep(s),
                    id: name,
                    type: 'line',
                    name,
                    color,
                    dashStyle: dashStyle ?? s.dashStyle,
                    data: trendData,
                    lineWidth,
                    linkedTo: settings?.linked ? s.id : undefined,
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
    if (!(chartStateData?.trends?.enabled || chartStateData?.smoothing?.enabled)) {
        return chartData;
    }

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
            if (shouldHideOriginalLines) {
                (gChartData.series.data as LineSeries[]).forEach((s) => {
                    s.opacity = 0.3;
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
                    if (s.color) {
                        s.color = chroma(String(s.color)).alpha(0.3).hex();
                    }
                });
            }
            series.push(...(newChartSeries as GraphWidgetSeriesOptions[]));
            if ('enableSum' in chartData.config) {
                chartData.config.enableSum = false;
            }

            break;
        }
    }

    return chartData;
}
