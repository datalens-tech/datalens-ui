import type {
    ChartData,
    ChartSeries,
    ChartYAxis,
    LineSeries,
} from '@gravity-ui/chartkit/gravity-charts';
import groupBy from 'lodash/groupBy';
import merge from 'lodash/merge';
import sortBy from 'lodash/sortBy';

import type {
    SeriesExportSettings,
    ServerField,
    WizardVisualizationId,
} from '../../../../../../../shared';
import {
    AxisMode,
    PlaceholderId,
    getFakeTitleOrTitle,
    getIsNavigatorEnabled,
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
import {getSeriesRangeSliderConfig} from '../../gravity-charts/utils/range-slider';
import {getConfigWithActualFieldTypes} from '../../utils/config-helpers';
import {getExportColumnSettings} from '../../utils/export-helpers';
import {SEGMENT_TITLE_BASE_CONFIG} from '../constants';
import {getAxisFormatting, getAxisType, getYAxisPlaceholders} from '../helpers/axis';
import {DATA_LABEL_DEFAULT_PADDING} from '../helpers/axis/data-labels';
import {concatStringValues} from '../helpers/common';
import {isXAxisReversed} from '../helpers/highcharts';
import {getSegmentMap} from '../helpers/segments';
import type {PrepareFunctionArgs} from '../types';
import {
    mapChartkitFormatSettingsToGravityChartValueFormat,
    mapToGravityChartValueFormat,
} from '../utils';

import {prepareLineData} from './prepare-line-data';
import type {ExtendedLineSeries, ExtendedLineSeriesData} from './types';

// eslint-disable-next-line complexity
export function prepareGravityChartLine(args: PrepareFunctionArgs) {
    const {
        labels,
        placeholders,
        disableDefaultSorting = false,
        shared,
        idToDataType,
        colors,
        shapes,
        segments: split,
        sort,
        visualizationId,
    } = args;
    const baseConfig = getBaseChartConfig({
        shared,
        visualization: {placeholders, id: visualizationId},
    });
    const xPlaceholder = placeholders.find((p) => p.id === PlaceholderId.X);
    const xField: ServerField | undefined = xPlaceholder?.items?.[0];
    const yPlaceholder = placeholders.find((p) => p.id === PlaceholderId.Y);
    const yFields = yPlaceholder?.items || [];
    const y2Placeholder = placeholders.find((p) => p.id === PlaceholderId.Y2);
    const y2Fields = y2Placeholder?.items || [];

    const isSecondOnlyYAxis = !yFields.length && y2Fields.length;

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

    const chartYAxisItems = getYAxisPlaceholders({placeholders, shared});

    const isYAxisEmpty = !yFields.length && !y2Fields.length;
    if (!xField || isYAxisEmpty) {
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
    const isMultiAxis = Boolean(yPlaceholder?.items.length && y2Placeholder?.items.length);
    const preparedData = prepareLineData(args);
    const xCategories = preparedData.categories;

    const colorItem = colors[0];
    const shapeItem = shapes[0];

    const xValueExportSetting = getExportColumnSettings({
        path: isCategoriesXAxis ? 'category' : 'x',
        field: xField,
    });
    const yValueExportSetting = getExportColumnSettings({path: 'y', field: yFields[0]});

    const shouldUseHtmlForLabels =
        isMarkupField(labelField) || isHtmlField(labelField) || isMarkdownField(labelField);
    const inNavigatorEnabled = getIsNavigatorEnabled(shared);

    const layers = shared.visualization?.layers ?? [];
    const hasMultipleLayers = layers.length > 1;

    const seriesData: ExtendedLineSeries[] = preparedData.graphs.map<LineSeries>((graph: any) => {
        const rangeSlider: LineSeries['rangeSlider'] = inNavigatorEnabled
            ? {
                  ...getSeriesRangeSliderConfig({
                      extraSettings: shared.extraSettings,
                      seriesName: graph.title,
                  }),
                  lineWidth: 1,
              }
            : undefined;

        let seriesName = graph.title;
        if (graph.colorGuid && hasMultipleLayers) {
            seriesName = `${graph.measureFieldTitle}: ${graph.title}`;
        }

        if (graph.custom?.segmentTitle) {
            seriesName = concatStringValues(graph.custom.segmentTitle, ': ', seriesName);
        }

        const labelFormatting = graph.dataLabels
            ? mapToGravityChartValueFormat({field: labelField, formatSettings: graph.dataLabels})
            : undefined;
        let yAxisIndex = graph.yAxis;
        if (!isSplitEnabled && isSecondOnlyYAxis && chartYAxisItems.length > 1) {
            yAxisIndex = 1;
        }

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
            type: 'line',
            color: graph.color,
            nullMode: graph.connectNulls ? 'connect' : 'skip',
            data: graph.data.reduce((acc: ExtendedLineSeriesData[], item: any, index: number) => {
                const dataItem: ExtendedLineSeriesData = {
                    y: item?.y ?? null,
                    custom: item.custom,
                };

                if (isDataLabelsEnabled) {
                    if (item?.y === null) {
                        dataItem.label = '';
                    } else {
                        dataItem.label = item?.label;
                    }
                }

                let x: ExtendedLineSeriesData['x'];
                if (isCategoriesXAxis) {
                    x = index;
                } else if (!item && xCategories) {
                    x = xCategories[index];
                } else {
                    x = item?.x;
                }

                if (!isCategoriesXAxis && !Number.isFinite(x)) {
                    return acc;
                }

                dataItem.x = x;

                acc.push(dataItem);

                return acc;
            }, []),
            dataLabels: {
                enabled: isDataLabelsEnabled,
                html: shouldUseHtmlForLabels,
                format: labelFormatting,
                padding: DATA_LABEL_DEFAULT_PADDING,
            },
            legend: {
                symbol: {
                    width: 36,
                },
                groupId: graph.id,
                itemText: graph.legendTitle,
            },
            dashStyle: graph.dashStyle,
            lineWidth: graph.lineWidth,
            linecap: graph.linecap,
            linejoin: graph.linejoin,
            tooltip: graph.tooltip?.chartKitFormatting
                ? {
                      valueFormat: mapChartkitFormatSettingsToGravityChartValueFormat({
                          chartkitFormatSettings: graph.tooltip,
                      }),
                  }
                : undefined,
            yAxis: yAxisIndex,
            custom: {
                ...graph.custom,
                exportSettings,
                colorValue: graph.colorValue,
                shapeValue: graph.shapeValue,
                drillDownFilterValue: graph.drillDownFilterValue,
            },
            rangeSlider,
        };
    });

    const shouldUseHtmlForLegend = [colorItem, shapeItem].some(isHtmlField);
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

    if (xAxis && isXAxisReversed(xField, sort, visualizationId as WizardVisualizationId)) {
        xAxis.order = 'reverse';
    }

    let yAxis: ChartYAxis[] = [];
    if (isSplitEnabled) {
        yAxis = segments.reduce((acc, d) => {
            const placeholder = d.isOpposite ? y2Placeholder : yPlaceholder;
            const labelNumberFormat = placeholder
                ? getAxisFormatting({
                      placeholder,
                      visualizationId,
                  })
                : undefined;

            const axisBaseConfig = getYAxisBaseConfig({
                placeholder,
            });
            const shouldUseSegmentTitle = isMultiAxis ? !d.isOpposite : placeholder?.items.length;
            let axisTitle: ChartYAxis['title'] | null = null;
            if (shouldUseSegmentTitle) {
                let titleText: string = d.title;
                if (isSplitWithHtmlValues) {
                    // @ts-ignore There may be a type mismatch due to the wrapper over html, markup and markdown
                    titleText = wrapHtml(d.title);
                }
                axisTitle = {
                    ...SEGMENT_TITLE_BASE_CONFIG,
                    text: titleText,
                    html: isSplitWithHtmlValues,
                };
            }

            const chartYAxis = merge(axisBaseConfig, {
                title: axisTitle,
                plotIndex: d.plotIndex,
                labels: {
                    numberFormat: labelNumberFormat ?? undefined,
                },
                position: placeholder?.id === PlaceholderId.Y2 ? 'right' : 'left',
            });

            if (chartYAxis.min === undefined) {
                chartYAxis.startOnTick = true;
            }

            if (chartYAxis.max === undefined) {
                chartYAxis.endOnTick = true;
            }

            acc.push(chartYAxis);

            return acc;
        }, [] as ChartYAxis[]);
    } else {
        yAxis = chartYAxisItems.map((placeholder) => {
            const labelNumberFormat = placeholder
                ? getAxisFormatting({
                      placeholder,
                      visualizationId,
                  })
                : undefined;

            const axisBaseConfig = getYAxisBaseConfig({
                placeholder,
            });

            const chartYAxis = merge(axisBaseConfig, {
                labels: {
                    numberFormat: labelNumberFormat ?? undefined,
                },
                lineColor: 'transparent',
                position: placeholder?.id === PlaceholderId.Y2 ? 'right' : 'left',
                maxPadding: 0.001,
            });

            if (chartYAxis.min === undefined) {
                chartYAxis.startOnTick = true;
            }

            if (chartYAxis.max === undefined) {
                chartYAxis.endOnTick = true;
            }

            return chartYAxis;
        });
    }

    const config: ExtendedChartData = {
        series: {
            data: seriesData as ChartSeries[],
        },
        xAxis,
        yAxis,
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

    if (isSplitEnabled) {
        config.split = {
            enable: true,
            gap: '40px',
            plots: Object.values(groupBy(segments, (d) => d.plotIndex)).map(() => {
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
