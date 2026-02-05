import type {ChartData, LineSeries} from '@gravity-ui/chartkit/gravity-charts';
import chroma from 'chroma-js';
import cloneDeep from 'lodash/cloneDeep';
import {PolynomialRegression} from 'ml-regression-polynomial';
import type {
    ChartStateSettings,
    ChartStateWarning,
    SmoothingLineSettings,
    TrendLineSettings,
} from 'shared';
import {DEFAULT_SMOOTHING, DEFAULT_TREND_SETTINGS, WidgetKind} from 'shared';
import type {
    ChartContentWidgetData,
    GraphWidget,
    GraphWidgetSeriesOptions,
} from 'ui/libs/DatalensChartkit/types';

function getDarkenColor(originalColor: unknown, value = 0.8) {
    const color = chroma(String(originalColor));
    return color.set('lab.l', color.get('lab.l') * value).hex();
}

type PointData = {x: number; y: number};

function generateTrendLine({
    data,
    method,
    warnings,
}: {
    data: PointData[];
    method: TrendLineSettings['method'];
    warnings: Set<ChartStateWarning>;
}) {
    const trendLine: PointData[] = [];
    const xValues: number[] = [];
    const yValues: number[] = [];

    data.forEach((point) => {
        if (typeof point.x === 'number' && typeof point.y === 'number') {
            xValues.push(point.x);
            yValues.push(point.y);
        } else {
            warnings.add('dataWithNull');
        }
    });
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

function sma({
    data,
    windowSize,
    warnings,
}: {
    data: PointData[];
    windowSize: number;
    warnings: Set<ChartStateWarning>;
}) {
    const result = [];
    let sum = 0;

    for (let i = 0; i < data.length; i++) {
        const point = data[i];
        if (point.x === null || point.y === null) {
            warnings.add('dataWithNull');
        }

        sum += point.y;

        if (i < windowSize - 1) {
            result.push({...point});
        } else {
            if (i >= windowSize) {
                sum -= data[i - windowSize].y;
            }
            result.push({
                x: point.x,
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
    warnings,
}: {
    data: PointData[];
    windowSize: number;
    method: SmoothingLineSettings['method'];
    warnings: Set<ChartStateWarning>;
}) {
    switch (method) {
        case 'sma':
        default: {
            return sma({data, windowSize, warnings});
        }
    }
}

function createTrendSeries({
    chartData,
    settings,
    warnings,
}: {
    chartData: ChartContentWidgetData;
    settings: TrendLineSettings | undefined;
    warnings: Set<ChartStateWarning>;
}) {
    const regressionMethod = settings?.method ?? DEFAULT_TREND_SETTINGS.method;
    const lineWidth = settings?.lineWidth ?? DEFAULT_TREND_SETTINGS.lineWidth;
    const linked = settings?.linked ?? DEFAULT_TREND_SETTINGS.linked;

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
                    warnings,
                });
                const originalSeriesName = s.name;
                const color = getDarkenColor(s.color);

                const newSeries = {
                    ...cloneDeep(s),
                    type: 'line',
                    name: `${originalSeriesName}: тренд`,
                    color,
                    dashStyle: (dashStyle ?? 'Dash') as LineSeries['dashStyle'],
                    data: trendData,
                    lineWidth,
                };

                if (!linked) {
                    if (newSeries.legend?.groupId) {
                        newSeries.legend.groupId += 'trend';
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
                    warnings,
                });
                const originalSeriesName = s.name ?? s.title ?? s.id;
                const name = `${originalSeriesName}: тренд`;
                const color = getDarkenColor(s.color);

                return {
                    ...cloneDeep(s),
                    id: linked ? s.id : name,
                    type: 'line',
                    name: name,
                    color,
                    dashStyle: dashStyle ?? 'Dash',
                    data: trendData,
                    lineWidth,
                    linkedTo: linked ? s.id : undefined,
                };
            });
        }
    }

    return [];
}

function createSmoothingSeries({
    chartData,
    settings,
    warnings,
}: {
    chartData: ChartContentWidgetData;
    settings: SmoothingLineSettings | undefined;
    warnings: Set<ChartStateWarning>;
}) {
    const method = settings?.method ?? 'sma';
    const windowSize = Number(settings?.windowSize ?? DEFAULT_SMOOTHING.windowSize);
    const lineWidth = settings?.lineWidth ?? DEFAULT_SMOOTHING.lineWidth;
    const linked = settings?.linked ?? DEFAULT_SMOOTHING.linked;

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
                    warnings,
                });
                const originalSeriesName = s.name;
                const color = getDarkenColor(s.color);

                const newSeries = {
                    ...cloneDeep(s),
                    type: 'line',
                    name: `${originalSeriesName}: сглаживание`,
                    color,
                    dashStyle: (dashStyle ?? s.dashStyle) as LineSeries['dashStyle'],
                    data: seriesData,
                    lineWidth,
                };

                if (!linked) {
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
                    warnings,
                });
                const originalSeriesName = s.name ?? s.title ?? s.id;
                const name = `${originalSeriesName}: сглаживание`;
                const color = getDarkenColor(s.color);

                return {
                    ...cloneDeep(s),
                    id: linked ? s.id : name,
                    type: 'line',
                    name,
                    color,
                    dashStyle: dashStyle ?? s.dashStyle,
                    data: trendData,
                    lineWidth,
                    linkedTo: linked ? s.id : undefined,
                };
            });
        }
    }

    return [];
}

export function addChartModelingSeries({
    chartStateData,
    chartData,
}: {
    chartStateData: ChartStateSettings;
    chartData: ChartContentWidgetData;
}) {
    const warnings = new Set<ChartStateWarning>();
    if (!(chartStateData?.trends?.enabled || chartStateData?.smoothing?.enabled)) {
        return {warnings: Array.from(warnings), chartData};
    }

    const newChartSeries = [];
    let shouldHideOriginalLines = false;
    if (chartStateData?.trends?.enabled) {
        newChartSeries.push(
            ...createTrendSeries({
                chartData,
                settings: chartStateData.trends.settings,
                warnings,
            }),
        );
    }

    if (chartStateData?.smoothing?.enabled) {
        newChartSeries.push(
            ...createSmoothingSeries({
                chartData,
                settings: chartStateData.smoothing.settings,
                warnings,
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
                    if (s.color) {
                        s.color = chroma(String(s.color)).alpha(0.3).hex();
                    }
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

    return {warnings: Array.from(warnings), chartData};
}
