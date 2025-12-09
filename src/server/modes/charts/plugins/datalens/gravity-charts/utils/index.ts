import type {ChartData, ChartTitle, ChartYAxis} from '@gravity-ui/chartkit/gravity-charts';

import {PlaceholderId, WizardVisualizationId, isDateField} from '../../../../../../../shared';
import type {
    ServerCommonSharedExtraSettings,
    ServerPlaceholder,
    ServerPlaceholderSettings,
} from '../../../../../../../shared';
import {getAxisTitle, getTickPixelInterval, isGridEnabled} from '../../utils/axis-helpers';

export function getChartTitle(settings?: ServerCommonSharedExtraSettings): ChartTitle | undefined {
    if (settings?.titleMode !== 'hide' && settings?.title) {
        return {
            text: settings.title,
        };
    }

    return undefined;
}

export function getAxisLabelsRotationAngle(placeholderSettings?: ServerPlaceholderSettings) {
    switch (placeholderSettings?.labelsView) {
        case 'horizontal': {
            return 0;
        }
        case 'vertical': {
            return 90;
        }
        case 'angle': {
            return 45;
        }
    }

    return undefined;
}

function getAxisMinMax(
    placeholderSettings?: ServerPlaceholderSettings,
): [number | undefined, number | undefined] {
    if (
        placeholderSettings?.scale !== 'manual' ||
        !Array.isArray(placeholderSettings?.scaleValue)
    ) {
        return [undefined, undefined];
    }

    const min = Number(placeholderSettings.scaleValue[0]);
    const max = Number(placeholderSettings.scaleValue[1]);

    return [Number.isNaN(min) ? undefined : min, Number.isNaN(max) ? undefined : max];
}

export function getYAxisBaseConfig({
    visualization,
}: {
    visualization: {id: string; placeholders: ServerPlaceholder[]};
}): ChartYAxis {
    const yPlaceholder = visualization.placeholders.find((p) => p.id === PlaceholderId.Y);
    const yPlaceholderSettings = yPlaceholder?.settings || {};
    const yItem = yPlaceholder?.items[0];

    const [yMin, yMax] = getAxisMinMax(yPlaceholderSettings);

    return {
        // todo: the axis type should depend on the type of field
        type: isDateField(yItem) ? 'datetime' : 'linear',
        visible: yPlaceholderSettings?.axisVisibility !== 'hide',
        labels: {
            enabled: Boolean(yItem) && yPlaceholder?.settings?.hideLabels !== 'yes',
            rotation: getAxisLabelsRotationAngle(yPlaceholder?.settings),
        },
        title: {
            text: getAxisTitle(yPlaceholderSettings, yItem) || undefined,
        },
        grid: {
            enabled: Boolean(yItem) && isGridEnabled(yPlaceholderSettings),
        },
        ticks: {
            pixelInterval: getTickPixelInterval(yPlaceholderSettings) || 72,
        },
        lineColor: 'var(--g-color-line-generic)',
        min: yMin,
        max: yMax,
    };
}

export function getBaseChartConfig(args: {
    extraSettings?: ServerCommonSharedExtraSettings;
    visualization: {id: string; placeholders: ServerPlaceholder[]};
}) {
    const {extraSettings, visualization} = args;
    const isLegendEnabled = extraSettings?.legendMode !== 'hide';

    const xPlaceholder = visualization.placeholders.find((p) => p.id === PlaceholderId.X);
    const xItem = xPlaceholder?.items[0];
    const xPlaceholderSettings = xPlaceholder?.settings || {};

    let chartWidgetData: Partial<ChartData> = {
        title: getChartTitle(extraSettings),
        tooltip: {
            enabled: extraSettings?.tooltip !== 'hide',
            totals: {
                enabled: extraSettings?.tooltipSum !== 'off',
            },
        },
        legend: {enabled: isLegendEnabled},
        series: {
            data: [],
            options: {
                'bar-x': {
                    barMaxWidth: 50,
                    barPadding: 0.05,
                    groupPadding: 0.4,
                    dataSorting: {
                        direction: 'desc',
                        key: 'name',
                    },
                },
                line: {
                    lineWidth: 2,
                },
            },
        },
        chart: {
            margin: {
                top: 10,
                left: 10,
                right: 10,
                bottom: 15,
            },
            zoom: {
                enabled: true,
                resetButton: {
                    align: 'top-right',
                    offset: {x: 2, y: 30},
                    relativeTo: 'plot-box',
                },
            },
        },
    };

    const visualizationId = visualization.id as WizardVisualizationId;
    const visualizationWithoutAxis = [
        WizardVisualizationId.Pie,
        WizardVisualizationId.Donut,
        WizardVisualizationId.Treemap,
    ];

    const visualizationWithYMainAxis = [WizardVisualizationId.Bar, WizardVisualizationId.Bar100p];

    if (!visualizationWithoutAxis.includes(visualizationId)) {
        const [xMin, xMax] = getAxisMinMax(xPlaceholderSettings);

        chartWidgetData = {
            ...chartWidgetData,
            xAxis: {
                visible: xPlaceholderSettings?.axisVisibility !== 'hide',
                labels: {
                    enabled: xPlaceholderSettings?.hideLabels !== 'yes',
                    rotation: getAxisLabelsRotationAngle(xPlaceholderSettings),
                },
                title: {
                    text: getAxisTitle(xPlaceholderSettings, xItem) || undefined,
                },
                grid: {
                    enabled: isGridEnabled(xPlaceholderSettings),
                },
                ticks: {
                    pixelInterval: getTickPixelInterval(xPlaceholderSettings) || 120,
                },
                lineColor: 'var(--g-color-line-generic)',
                min: xMin,
                max: xMax,
            },
            yAxis: [getYAxisBaseConfig({visualization})],
        };

        if (visualizationWithYMainAxis.includes(visualizationId)) {
            chartWidgetData.xAxis = {...chartWidgetData.xAxis, lineColor: 'transparent'};
        } else {
            chartWidgetData.yAxis = (chartWidgetData.yAxis || []).map((yAxis) => ({
                ...yAxis,
                lineColor: 'transparent',
            }));
        }
    }

    return chartWidgetData;
}
