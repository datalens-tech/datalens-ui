import type {ChartData} from '@gravity-ui/chartkit/gravity-charts';
import {Feature, WidgetKind} from 'shared';
import type {ChartsData} from 'ui/libs/DatalensChartkit/modules/data-provider/charts';
import type {GraphWidget, Widget, WidgetBase} from 'ui/libs/DatalensChartkit/types';

import {isEnabledFeature} from '../isEnabledFeature';

export function isChartModelingAvailable({
    loadedData,
}: {
    loadedData: Widget & ChartsData & WidgetBase;
}) {
    if (!isEnabledFeature(Feature.ChartModeling)) {
        return false;
    }

    switch (loadedData.type) {
        case WidgetKind.GravityCharts: {
            const chartData = loadedData.data as ChartData;
            return (
                chartData.series.data.every((s) => s.type === 'line') &&
                chartData.xAxis?.type !== 'category'
            );
        }
        case WidgetKind.Graph: {
            const graphWidget = loadedData as GraphWidget;
            const xAxes = [graphWidget.libraryConfig.xAxis].flat();
            return (
                graphWidget.libraryConfig.chart?.type === 'line' &&
                !xAxes.some((xAxis) => xAxis?.type === 'category')
            );
        }
        default: {
            return false;
        }
    }
}
