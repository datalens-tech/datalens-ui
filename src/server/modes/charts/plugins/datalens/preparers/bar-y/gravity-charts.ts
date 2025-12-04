import type {BarYSeries, ChartData} from '@gravity-ui/chartkit/gravity-charts';
import merge from 'lodash/merge';

import type {SeriesExportSettings, ServerField} from '../../../../../../../shared';
import {
    LabelsPositions,
    PERCENT_VISUALIZATIONS,
    PlaceholderId,
    getFakeTitleOrTitle,
    isDateField,
    isHtmlField,
    isMarkdownField,
    isMarkupField,
} from '../../../../../../../shared';
import type {ExtendedChartData} from '../../../../../../../shared/types/chartkit';
import {getBaseChartConfig} from '../../gravity-charts/utils';
import {getFieldFormatOptions} from '../../gravity-charts/utils/format';
import {colorizeByColorValues} from '../../utils/color-helpers';
import {getExportColumnSettings} from '../../utils/export-helpers';
import {getAxisFormatting} from '../helpers/axis';
import {getLegendColorScale, shouldUseGradientLegend} from '../helpers/legend';
import type {PrepareFunctionArgs} from '../types';
import {mapToGravityChartValueFormat} from '../utils';

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

    const shouldUsePercentStacking = PERCENT_VISUALIZATIONS.has(visualizationId);
    const dataLabelsInside =
        shouldUsePercentStacking ||
        shared.extraSettings?.labelsPosition !== LabelsPositions.Outside;

    let gradientColorMap: Record<string, string | null> = {};
    const shouldSetColorByValues = graphs.some((s) =>
        s.data.some((d: any) => !d.color && d.colorValue),
    );
    if (shouldSetColorByValues) {
        const colorValues: number[] = [];
        graphs.forEach((s) => {
            s.data.forEach((d: any) => {
                const colorValue = Number(d.colorValue);
                if (Number.isFinite(colorValue)) {
                    colorValues.push(colorValue);
                }
            });
        });

        const gradientColors = colorizeByColorValues({colorsConfig, colorValues});

        gradientColorMap = gradientColors.reduce(
            (acc, color, index) => {
                acc[String(colorValues[index])] = color;

                return acc;
            },
            {} as Record<string, string | null>,
        );
    }

    const series = graphs.map<BarYSeries>((graph) => {
        const labelFormatting = graph.dataLabels
            ? mapToGravityChartValueFormat({field: labelField, formatSettings: graph.dataLabels})
            : undefined;
        const shouldUsePercentageAsLabel =
            labelFormatting &&
            'labelMode' in labelFormatting &&
            labelFormatting?.labelMode === 'percent';
        return {
            ...graph,
            type: 'bar-y',
            stackId: graph.stack,
            stacking: shouldUsePercentStacking ? 'percent' : 'normal',
            name: graph.title,
            data: graph.data.map((d: BarYPoint) => {
                const {x, y, label: originalLabel, ...other} = d;
                const total =
                    graphs.reduce(
                        (sum, g) =>
                            sum + (g.data.find((point: BarYPoint) => point.x === x)?.y ?? 0),
                        0,
                    ) ?? 0;
                const percentage = (d.y / total) * 100;
                const label = shouldUsePercentageAsLabel ? percentage : originalLabel;

                let color = d.color;
                if (!color && typeof d.colorValue === 'number') {
                    color = gradientColorMap[String(d.colorValue)];
                }

                return {...other, y: x, x: y, label, total, percentage, color};
            }),
            dataLabels: {
                enabled: graph.dataLabels?.enabled,
                inside: dataLabelsInside,
                html: shouldUseHtmlForLabels,
                format: labelFormatting,
            },
            tooltip: graph.tooltip?.chartKitFormatting
                ? {
                      valueFormat: {
                          type: 'number',
                          precision: graph.tooltip.chartKitPrecision,
                      },
                  }
                : undefined,
            custom: {
                ...graph.custom,
                colorValue: graph.colorValue,
                exportSettings,
            },
        } as BarYSeries;
    });

    const xAxisLabelNumberFormat = xPlaceholder
        ? getAxisFormatting({
              placeholder: xPlaceholder,
              visualizationId,
          })
        : undefined;

    const config: ExtendedChartData = {
        series: {
            data: series,
            options: {
                'bar-y': {
                    stackGap: 0,
                    borderWidth: 1,
                },
            },
        },
        xAxis: {
            type: 'linear',
            labels: {
                numberFormat: xAxisLabelNumberFormat ?? undefined,
            },
        },
        custom: {
            tooltip: {
                headerLabel:
                    isDateField(yField) && !hasCategories ? undefined : getFakeTitleOrTitle(yField),
            },
        },
    };

    if (config.series.data.length && shouldUseGradientLegend(colorItem, colorsConfig, shared)) {
        const points = graphs
            .map((graph) => (graph.data ?? []).map((d: BarYPoint) => ({colorValue: d.colorValue})))
            .flat(2);

        const colorScale = getLegendColorScale({
            colorsConfig,
            points,
        });

        config.legend = {
            enabled: shared.extraSettings?.legendMode !== 'hide',
            type: 'continuous',
            title: {text: getFakeTitleOrTitle(colorItem), style: {fontWeight: '500'}},
            colorScale,
        };
    } else if (graphs.length <= 1) {
        config.legend = {enabled: false};
    }

    if (xField) {
        config.tooltip = {
            ...config.tooltip,
            valueFormat: getFieldFormatOptions({field: xField}),
        };
    }

    if (hasCategories) {
        config.yAxis = [
            {
                type: 'category',
                categories: categories as string[],
                order: 'reverse',
                labels: {
                    enabled: yPlaceholder?.settings?.hideLabels !== 'yes',
                    html: isHtmlField(yField) || isMarkdownField(yField) || isMarkupField(yField),
                    maxWidth: '33%',
                    padding: 0,
                },
            },
        ];
    } else {
        const axisLabelNumberFormat = yPlaceholder
            ? getAxisFormatting({
                  placeholder: yPlaceholder,
                  visualizationId,
              })
            : undefined;

        config.yAxis = [
            {
                labels: {
                    enabled: yPlaceholder?.settings?.hideLabels !== 'yes',
                    numberFormat: axisLabelNumberFormat ?? undefined,
                },
                maxPadding: 0,
                order: 'reverse',
            },
        ];
    }

    return merge(getBaseChartConfig(shared), config);
}
