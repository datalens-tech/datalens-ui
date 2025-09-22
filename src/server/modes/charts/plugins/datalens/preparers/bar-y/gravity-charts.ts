import type {BarYSeries, ChartData} from '@gravity-ui/chartkit/gravity-charts';
import merge from 'lodash/merge';

import type {SeriesExportSettings, ServerField} from '../../../../../../../shared';
import {
    PERCENT_VISUALIZATIONS,
    PlaceholderId,
    isHtmlField,
    isMarkdownField,
    isMarkupField,
} from '../../../../../../../shared';
import {getBaseChartConfig} from '../../gravity-charts/utils';
import {getFieldFormatOptions} from '../../gravity-charts/utils/format';
import {getExportColumnSettings} from '../../utils/export-helpers';
import type {PrepareFunctionArgs} from '../types';

import {prepareBarYData} from './prepare-bar-y-data';

type BarYPoint = {x: number; y: number} & Record<string, unknown>;

export function prepareGravityChartsBarY(args: PrepareFunctionArgs): ChartData {
    const {shared, visualizationId, colors, labels, placeholders} = args;
    const {graphs, categories} = prepareBarYData(args);
    const hasCategories = Boolean(categories?.length);
    const xPlaceholder = placeholders.find((p) => p.id === PlaceholderId.X);
    const xField: ServerField | undefined = xPlaceholder?.items?.[0];
    const yPlaceholder = placeholders.find((p) => p.id === PlaceholderId.Y);
    const yField: ServerField | undefined = yPlaceholder?.items?.[0];
    const labelField = labels?.[0];

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

    const shouldUseHtmlForLabels =
        isMarkupField(labelField) || isHtmlField(labelField) || isMarkdownField(labelField);

    const dataLabelFormat = getFieldFormatOptions({field: labelField});
    const shouldUsePercentStacking = PERCENT_VISUALIZATIONS.has(visualizationId);
    const series = graphs.map<BarYSeries>((graph) => {
        return {
            ...graph,
            type: 'bar-y',
            stackId: graph.stack,
            stacking: shouldUsePercentStacking ? 'percent' : 'normal',
            name: graph.title,
            data: graph.data
                .filter((d: BarYPoint) => d !== null && d.y !== null)
                .map((d: BarYPoint) => {
                    const {x, y, ...other} = d;

                    return {y: x, x: y, ...other};
                }),
            dataLabels: {
                enabled: graph.dataLabels?.enabled,
                inside: shouldUsePercentStacking,
                html: shouldUseHtmlForLabels,
                format: dataLabelFormat,
            },
            custom: {
                ...graph.custom,
                colorValue: graph.colorValue,
                exportSettings,
            },
        } as BarYSeries;
    });

    const config: ChartData = {
        series: {
            data: series.filter((s) => s.data.length),
        },
        xAxis: {
            min: 0,
            type: 'linear',
        },
    };

    if (xField) {
        config.tooltip = {
            valueFormat: getFieldFormatOptions({field: xField}),
        };
    }

    if (hasCategories) {
        config.yAxis = [
            {
                type: 'category',
                categories: categories as string[],
            },
        ];
    }

    return merge(getBaseChartConfig(shared), config);
}
