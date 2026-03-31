import type {
    AreaSeries,
    AreaSeriesData,
    ChartData,
    ChartSeries,
} from '@gravity-ui/chartkit/gravity-charts';
import merge from 'lodash/merge';
import sortBy from 'lodash/sortBy';

import type {SeriesExportSettings, ServerField} from '../../../../../../../shared';
import {
    AxisMode,
    PlaceholderId,
    WizardVisualizationId,
    getFakeTitleOrTitle,
    getXAxisMode,
    isDateField,
    isHtmlField,
    isMarkdownField,
    isMarkupField,
    isNumberField,
} from '../../../../../../../shared';
import type {ExtendedChartData} from '../../../../../../../shared/types/chartkit';
import {wrapHtml} from '../../../../../../../shared/utils/ui-sandbox';
import {
    getBaseChartConfig,
    getTotalsPrecisionFromSeriesTooltips,
    getYAxisBaseConfig,
} from '../../gravity-charts/utils';
import {getFieldFormatOptions} from '../../gravity-charts/utils/format';
import {getConfigWithActualFieldTypes} from '../../utils/config-helpers';
import {getExportColumnSettings} from '../../utils/export-helpers';
import {SEGMENT_TITLE_BASE_CONFIG} from '../constants';
import {getAxisFormatting, getAxisType} from '../helpers/axis';
import {DATA_LABEL_DEFAULT_PADDING} from '../helpers/axis/data-labels';
import {concatStringValues} from '../helpers/common';
import {getSegmentMap} from '../helpers/segments';
import {prepareLineData} from '../line/prepare-line-data';
import type {PrepareFunctionArgs} from '../types';
import {
    mapChartkitFormatSettingsToGravityChartValueFormat,
    mapToGravityChartValueFormat,
} from '../utils';

import type {ExtendedAreaSeries, ExtendedAreaSeriesData} from './types';

type PreparedAreaPoint = {
    x?: AreaSeriesData['x'];
    y?: number | null;
    label?: AreaSeriesData['label'];
    custom?: AreaSeriesData['custom'];
};

// eslint-disable-next-line complexity
export function prepareGravityChartArea(args: PrepareFunctionArgs) {
    const {
        visualizationId,
        labels,
        placeholders,
        disableDefaultSorting = false,
        shared,
        idToDataType,
        colors,
        segments: split,
        layerSettings,
    } = args;
    const baseConfig = getBaseChartConfig({
        shared,
        visualization: {placeholders, id: visualizationId},
    });
    const xPlaceholder = placeholders.find((p) => p.id === PlaceholderId.X);
    const xField: ServerField | undefined = xPlaceholder?.items?.[0];
    const yPlaceholder = placeholders.find((p) => p.id === PlaceholderId.Y);
    const yFields = yPlaceholder?.items || [];
    const labelField = labels?.[0];
    const isDataLabelsEnabled = Boolean(labelField);
    const chartConfig = getConfigWithActualFieldTypes({config: shared, idToDataType});
    const xAxisMode = getXAxisMode({config: chartConfig}) ?? AxisMode.Discrete;
    const isCategoriesXAxis =
        !xField ||
        getAxisType({
            field: xField,
            settings: xPlaceholder?.settings,
            axisMode: xAxisMode,
        }) === 'category' ||
        disableDefaultSorting;

    if (!xField || !yFields.length) {
        return {
            series: {
                data: [],
            },
        };
    }

    const segmentField = split?.[0];
    const segmentsMap = getSegmentMap(args);
    const segments = sortBy(Object.values(segmentsMap), (s) => s.index);
    const isSplitEnabled = Boolean(segmentField);
    const isSplitWithHtmlValues = isHtmlField(segmentField);

    const preparedData = prepareLineData(args);
    const xCategories = preparedData.categories;

    const colorItem = colors[0];
    const xValueExportSetting = getExportColumnSettings({
        path: isCategoriesXAxis ? 'category' : 'x',
        field: xField,
    });
    const yValueExportSetting = getExportColumnSettings({path: 'y', field: yFields?.[0]});

    const shouldUseHtmlForLabels =
        isMarkupField(labelField) || isHtmlField(labelField) || isMarkdownField(labelField);
    const shouldUsePercentStacking = visualizationId === WizardVisualizationId.Area100p;

    let seriesTooltip: AreaSeries['tooltip'];
    if (!yFields.length) {
        seriesTooltip = {enabled: false};
    }

    const seriesData: ExtendedAreaSeries[] = preparedData.graphs.map<AreaSeries>((graph) => {
        const labelFormatting = graph.dataLabels
            ? mapToGravityChartValueFormat({field: labelField, formatSettings: graph.dataLabels})
            : undefined;
        const shouldUsePercentageAsLabel =
            labelFormatting &&
            'labelMode' in labelFormatting &&
            labelFormatting?.labelMode === 'percent';
        let seriesName = graph.title;

        if (graph.custom?.segmentTitle) {
            seriesName = concatStringValues(graph.custom.segmentTitle, ': ', seriesName);
        }

        let stacking: AreaSeries['stacking'];
        if (shouldUsePercentStacking) {
            stacking = 'percent';
        } else if (shared.extraSettings?.stacking !== 'off') {
            stacking = 'normal';
        }

        const tooltip = graph.tooltip?.chartKitFormatting
            ? {
                  ...seriesTooltip,
                  valueFormat: mapChartkitFormatSettingsToGravityChartValueFormat({
                      chartkitFormatSettings: graph.tooltip,
                  }),
              }
            : seriesTooltip;
        const stackId = [layerSettings?.id, graph.stack].filter(Boolean).join('__') || undefined;
        const exportSettings: SeriesExportSettings = {
            columns: [
                xValueExportSetting,
                {
                    ...yValueExportSetting,
                    id: seriesName,
                    name: seriesName,
                },
            ],
        };

        return {
            name: seriesName,
            type: 'area',
            stackId,
            stacking,
            color: graph.color,
            nullMode: graph.connectNulls ? 'connect' : 'skip',
            tooltip,
            data: graph.data.reduce(
                (acc: ExtendedAreaSeriesData[], item: PreparedAreaPoint, index: number) => {
                    const pointX = item?.x;
                    const total =
                        preparedData.graphs.reduce(
                            (sum, currentGraph) =>
                                sum +
                                (currentGraph.data.find(
                                    (point: PreparedAreaPoint) => point?.x === pointX,
                                )?.y ?? 0),
                            0,
                        ) ?? 0;
                    const ratio = total === 0 ? 0 : Number(item?.y ?? 0) / total;
                    const percentage = ratio * 100;
                    const labelValue = shouldUsePercentageAsLabel ? percentage : item?.label;
                    const dataItem: ExtendedAreaSeriesData = {
                        y: item?.y ?? null,
                        custom: item.custom,
                    };

                    if (isDataLabelsEnabled) {
                        if (item?.y === null) {
                            dataItem.label = '';
                        } else {
                            dataItem.label = labelValue;
                        }
                    }

                    if (isCategoriesXAxis) {
                        dataItem.x = index;
                    } else if (!item && xCategories) {
                        dataItem.x = xCategories[index];
                    } else {
                        dataItem.x = item?.x;
                    }

                    acc.push(dataItem);

                    return acc;
                },
                [],
            ),
            legend: {
                groupId: graph.id,
                itemText: graph.legendTitle,
            },
            dataLabels: {
                enabled: isDataLabelsEnabled,
                html: shouldUseHtmlForLabels,
                format: labelFormatting,
                padding: DATA_LABEL_DEFAULT_PADDING,
            },
            custom: {
                ...graph.custom,
                exportSettings,
                colorValue: graph.colorValue,
                shapeValue: graph.shapeValue,
                drillDownFilterValue: graph.drillDownFilterValue,
            },
            yAxis: graph.yAxis,
        };
    });

    const shouldUseHtmlForLegend = isHtmlField(colorItem);
    const legend: ChartData['legend'] = {html: shouldUseHtmlForLegend};
    const nonEmptyLegendGroups = Array.from(
        new Set(seriesData.map((s) => s.legend?.groupId).filter(Boolean)),
    );
    if (isSplitEnabled && nonEmptyLegendGroups.length <= 1) {
        legend.enabled = false;
    }

    let xAxis: ChartData['xAxis'] = {
        startOnTick: false,
        endOnTick: false,
    };

    if (isCategoriesXAxis) {
        xAxis = {
            type: 'category',
            // @ts-ignore There may be a type mismatch due to the wrapper over html, markup and markdown
            categories: xCategories,
            labels: {
                html: isHtmlField(xField) || isMarkdownField(xField) || isMarkupField(xField),
            },
        };
    } else {
        if (isDateField(xField)) {
            xAxis.type = 'datetime';
        }

        if (isNumberField(xField)) {
            xAxis.type = xPlaceholder?.settings?.type === 'logarithmic' ? 'logarithmic' : 'linear';

            if (xAxis.type === 'logarithmic') {
                xAxis.startOnTick = true;
                xAxis.endOnTick = true;
            }
        }

        xAxis.tickMarks = {enabled: Boolean(baseConfig.xAxis?.labels?.enabled)};
    }

    const config: ExtendedChartData = {
        series: {
            data: seriesData as ChartSeries[],
        },
        xAxis,
        legend,
        custom: {
            tooltip: {
                headerLabel:
                    isDateField(xField) && !isCategoriesXAxis
                        ? undefined
                        : getFakeTitleOrTitle(xField),
            },
        },
    };

    const axisLabelNumberFormat = yPlaceholder
        ? getAxisFormatting({
              placeholder: yPlaceholder,
              visualizationId,
          })
        : undefined;

    const yAxisBaseConfig = merge(
        getYAxisBaseConfig({
            placeholder: yPlaceholder,
        }),
        {
            labels: {
                numberFormat: axisLabelNumberFormat ?? undefined,
            },
            startOnTick: true,
            endOnTick: true,
            maxPadding: 0.001,
        },
    );

    if (isSplitEnabled) {
        config.yAxis = segments.map((d) => {
            let titleText: string = d.title;
            if (isSplitWithHtmlValues) {
                // @ts-ignore There may be a type mismatch due to the wrapper over html, markup and markdown
                titleText = wrapHtml(d.title);
            }

            const axisTitle = {
                ...SEGMENT_TITLE_BASE_CONFIG,
                text: titleText,
                html: isSplitWithHtmlValues,
            };

            return merge({}, yAxisBaseConfig, {
                plotIndex: d.index,
                title: axisTitle,
            });
        });
    } else {
        config.yAxis = [{...yAxisBaseConfig, lineColor: 'transparent'}];
    }

    if (isSplitEnabled) {
        config.split = {
            enable: true,
            gap: '40px',
            plots: segments.map(() => {
                return {};
            }),
        };
    }

    if (yFields[0]) {
        const valueFormat = getFieldFormatOptions({field: yFields[0]});
        config.tooltip = {
            valueFormat,
            totals: {
                valueFormat:
                    valueFormat?.type === 'number' && valueFormat.format
                        ? valueFormat
                        : {
                              type: 'number',
                              precision: getTotalsPrecisionFromSeriesTooltips(seriesData),
                          },
            },
        };
    }

    return merge(baseConfig, config);
}
