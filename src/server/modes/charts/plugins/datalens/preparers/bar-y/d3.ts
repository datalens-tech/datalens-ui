import type {BarYSeries, ChartKitWidgetData} from '@gravity-ui/chartkit/build/types/widget-data';

import type {SeriesExportSettings, ServerField} from '../../../../../../../shared';
import {PlaceholderId, WizardVisualizationId} from '../../../../../../../shared';
import {getExportColumnSettings} from '../../utils/export-helpers';
import type {PrepareFunctionArgs} from '../types';

import {prepareBarYData} from './prepare-bar-y-data';

type BarYPoint = {x: number; y: number} & Record<string, unknown>;

export function prepareD3BarY(args: PrepareFunctionArgs): ChartKitWidgetData {
    const {visualizationId, colors, placeholders} = args;
    const {graphs, categories} = prepareBarYData(args);
    const hasCategories = Boolean(categories?.length);
    const xPlaceholder = placeholders.find((p) => p.id === PlaceholderId.X);
    const xField: ServerField | undefined = xPlaceholder?.items?.[0];
    const yPlaceholder = placeholders.find((p) => p.id === PlaceholderId.Y);
    const yField: ServerField | undefined = yPlaceholder?.items?.[0];

    const exportSettings: SeriesExportSettings = {
        columns: [
            getExportColumnSettings({path: hasCategories ? 'category' : 'y', field: yField}),
            getExportColumnSettings({path: 'x', field: xField}),
        ],
    };

    const colorItem = colors[0];
    if (colorItem) {
        exportSettings.columns.push(
            getExportColumnSettings({path: 'series.custom.colorValue', field: colorItem}),
        );
    }

    const series = graphs.map<BarYSeries>((graph) => {
        return {
            ...graph,
            type: 'bar-y',
            stacking: visualizationId === WizardVisualizationId.BarY100pD3 ? 'percent' : 'normal',
            name: graph.title,
            data: graph.data
                .filter((d: unknown) => d !== null)
                .map((d: BarYPoint) => {
                    const {x, y, ...other} = d;

                    return {y: x, x: y, ...other};
                }),
            dataLabels: {
                enabled: graph.dataLabels?.enabled,
                inside: visualizationId === WizardVisualizationId.BarY100pD3,
            },
            custom: {
                ...graph.custom,
                colorValue: graph.colorValue,
                exportSettings,
            },
        } as BarYSeries;
    });

    const config: ChartKitWidgetData = {
        series: {
            data: series.filter((s) => s.data.length),
        },
        xAxis: {
            min: 0,
        },
    };

    if (hasCategories) {
        config.yAxis = [
            {
                type: 'category',
                categories: categories as string[],
            },
        ];
    }

    return config;
}
