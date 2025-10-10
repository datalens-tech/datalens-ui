import type {ChartData, ChartTitle} from '@gravity-ui/chartkit/gravity-charts';

import {PlaceholderId, WizardVisualizationId, isDateField} from '../../../../../../../shared';
import type {
    ServerCommonSharedExtraSettings,
    ServerVisualization,
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

export function getBaseChartConfig(args: {
    extraSettings?: ServerCommonSharedExtraSettings;
    visualization: ServerVisualization;
}) {
    const {extraSettings, visualization} = args;
    const isLegendEnabled = extraSettings?.legendMode !== 'hide';

    const xPlaceholder = visualization.placeholders.find((p) => p.id === PlaceholderId.X);
    const xItem = xPlaceholder?.items[0];
    const xPlaceholderSettings = xPlaceholder?.settings || {};

    const yPlaceholder = visualization.placeholders.find((p) => p.id === PlaceholderId.Y);
    const yPlaceholderSettings = yPlaceholder?.settings || {};
    const yItem = yPlaceholder?.items[0];

    const chartWidgetData: Partial<ChartData> = {
        title: getChartTitle(extraSettings),
        tooltip: {enabled: extraSettings?.tooltip !== 'hide'},
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
        },
    };

    const visualizationId = visualization.id as WizardVisualizationId;
    const visualizationWithoutAxis = [
        WizardVisualizationId.Pie,
        WizardVisualizationId.PieD3,
        WizardVisualizationId.Donut,
        WizardVisualizationId.DonutD3,
        WizardVisualizationId.Treemap,
        WizardVisualizationId.TreemapD3,
    ];

    const visualizationWithYMainAxis = [
        WizardVisualizationId.Bar,
        WizardVisualizationId.Bar100p,
        WizardVisualizationId.BarYD3,
        WizardVisualizationId.BarY100pD3,
    ];

    if (!visualizationWithoutAxis.includes(visualizationId)) {
        Object.assign(chartWidgetData, {
            xAxis: {
                visible: xPlaceholderSettings?.axisVisibility !== 'hide',
                labels: {
                    enabled: xPlaceholderSettings?.hideLabels !== 'yes',
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
            },
            yAxis: [
                {
                    // todo: the axis type should depend on the type of field
                    type: isDateField(yItem) ? 'datetime' : 'linear',
                    visible: yPlaceholderSettings?.axisVisibility !== 'hide',
                    labels: {
                        enabled: yPlaceholder?.settings?.hideLabels !== 'yes',
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
                },
            ],
        });

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
