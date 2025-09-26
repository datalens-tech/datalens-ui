import type {BarYSeries, ChartData} from '@gravity-ui/chartkit/gravity-charts';
import merge from 'lodash/merge';

import type {SeriesExportSettings, ServerField} from '../../../../../../../shared';
import {
    PERCENT_VISUALIZATIONS,
    PlaceholderId,
    getFakeTitleOrTitle,
    isHtmlField,
    isMarkdownField,
    isMarkupField,
} from '../../../../../../../shared';
import {getBaseChartConfig} from '../../gravity-charts/utils';
import {getFieldFormatOptions} from '../../gravity-charts/utils/format';
import {getExportColumnSettings} from '../../utils/export-helpers';
import {shouldUseGradientLegend} from '../helpers/legend';
import type {PrepareFunctionArgs} from '../types';

import {prepareBarYData} from './prepare-bar-y-data';

type BarYPoint = {x: number; y: number} & Record<string, unknown>;

export function prepareGravityChartsBarY(args: PrepareFunctionArgs): ChartData {
    const {shared, visualizationId, colors, colorsConfig, labels, placeholders} = args;
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

    if (config.series.data.length && shouldUseGradientLegend(colorItem, colorsConfig, shared)) {
        config.legend = {
            enabled: true,
            type: 'continuous',
            title: {text: getFakeTitleOrTitle(colorItem), style: {fontWeight: '500'}},
            colorScale: {
                colors: colorsConfig.gradientColors,
                stops: colorsConfig.gradientColors.length === 2 ? [0, 1] : [0, 0.5, 1],
            },
        };
    } else if (graphs.length <= 1) {
        config.legend = {enabled: false};
    }

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
