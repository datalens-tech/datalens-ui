import type {ChartKitWidgetAxisType, ChartKitWidgetData} from '@gravity-ui/chartkit';

import type {
    ServerChartsConfig,
    ServerCommonSharedExtraSettings,
    ServerSort,
    ServerVisualization,
} from '../../../../../../shared';
import {PlaceholderId, isDateField} from '../../../../../../shared';
import {getAxisType} from '../preparers/helpers/axis';
import {getAllVisualizationsIds} from '../preparers/helpers/visualizations';
import {getAxisTitle, getTickPixelInterval, isGridEnabled} from '../utils/axis-helpers';
import {mapChartsConfigToServerConfig} from '../utils/config-helpers';

import {getChartTitle} from './utils';

type BuildD3ConfigArgs = {
    extraSettings?: ServerCommonSharedExtraSettings;
    visualization: ServerVisualization;
    sort?: ServerSort[];
};

export function buildD3Config(args: BuildD3ConfigArgs) {
    const {extraSettings, visualization, sort = []} = args;
    const isLegendEnabled = extraSettings?.legendMode !== 'hide';

    const xPlaceholder = visualization.placeholders.find((p) => p.id === PlaceholderId.X);
    const xItem = xPlaceholder?.items[0];
    const xPlaceholderSettings = xPlaceholder?.settings || {};

    const yPlaceholder = visualization.placeholders.find((p) => p.id === PlaceholderId.Y);
    const yPlaceholderSettings = yPlaceholder?.settings || {};
    const yItem = yPlaceholder?.items[0];

    const chartWidgetData: Partial<ChartKitWidgetData> = {
        title: getChartTitle(extraSettings),
        tooltip: {enabled: true},
        legend: {enabled: isLegendEnabled},
        xAxis: {
            type: getAxisType({
                field: xItem,
                settings: xPlaceholderSettings,
                visualizationIds: getAllVisualizationsIds(args),
                sort,
            }) as ChartKitWidgetAxisType | undefined,
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
                labels: {
                    enabled: Boolean(yItem) && yPlaceholder?.settings?.hideLabels !== 'yes',
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
                lineColor: 'transparent',
            },
        ],
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

    return chartWidgetData;
}

export function buildWizardD3Config(
    ...options: [{shared: ServerChartsConfig} | ServerChartsConfig]
) {
    let shared: ServerChartsConfig;

    if ('shared' in options[0]) {
        shared = options[0].shared;
    } else {
        shared = options[0];
    }

    shared = mapChartsConfigToServerConfig(shared);

    return buildD3Config(shared);
}
