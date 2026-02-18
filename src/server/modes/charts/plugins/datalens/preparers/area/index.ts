import type {
    AreaSeries,
    AreaSeriesData,
    ChartData,
    ChartSeries,
    ChartYAxis,
} from '@gravity-ui/chartkit/gravity-charts';
import merge from 'lodash/merge';
import sortBy from 'lodash/sortBy';

import type {
    SeriesExportSettings,
    ServerField,
    WrappedHTML,
    WrappedMarkdown,
} from '../../../../../../../shared';
import {
    AxisMode,
    PlaceholderId,
    WizardVisualizationId,
    getXAxisMode,
    isDateField,
    isHtmlField,
    isMarkdownField,
    isMarkupField,
    isNumberField,
} from '../../../../../../../shared';
import {wrapHtml} from '../../../../../../../shared/utils/ui-sandbox';
import {getBaseChartConfig, getYAxisBaseConfig} from '../../gravity-charts/utils';
import {getFieldFormatOptions} from '../../gravity-charts/utils/format';
import {getConfigWithActualFieldTypes} from '../../utils/config-helpers';
import {getExportColumnSettings} from '../../utils/export-helpers';
import {getAxisFormatting, getAxisType} from '../helpers/axis';
import {getSegmentMap} from '../helpers/segments';
import {prepareLineData} from '../line/prepare-line-data';
import type {PrepareFunctionArgs} from '../types';
import {
    mapChartkitFormatSettingsToGravityChartValueFormat,
    mapToGravityChartValueFormat,
} from '../utils';

type ExtendedLineSeriesData = Omit<AreaSeriesData, 'x'> & {
    x?: AreaSeriesData['x'] | WrappedHTML | WrappedMarkdown;
};

type PreparedAreaPoint = {
    x?: AreaSeriesData['x'];
    y?: number | null;
    label?: AreaSeriesData['label'];
    custom?: AreaSeriesData['custom'];
};

type ExtendedLineSeries = Omit<AreaSeries, 'data'> & {
    custom?: {
        exportSettings?: SeriesExportSettings;
    };
    data: ExtendedLineSeriesData[];
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
    } = args;
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

    const exportSettings: SeriesExportSettings = {
        columns: [
            getExportColumnSettings({path: 'x', field: xField}),
            getExportColumnSettings({path: 'y', field: yFields[0]}),
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
    const shouldUsePercentStacking = visualizationId === WizardVisualizationId.Area100p;

    let seriesTooltip: AreaSeries['tooltip'];
    if (!yFields.length) {
        seriesTooltip = {enabled: false};
    }

    const seriesData: ExtendedLineSeries[] = preparedData.graphs.map<AreaSeries>((graph) => {
        const labelFormatting = graph.dataLabels
            ? mapToGravityChartValueFormat({field: labelField, formatSettings: graph.dataLabels})
            : undefined;
        const shouldUsePercentageAsLabel =
            labelFormatting &&
            'labelMode' in labelFormatting &&
            labelFormatting?.labelMode === 'percent';
        let seriesName = graph.title;

        if (graph.custom?.segmentTitle) {
            seriesName = `${graph.custom.segmentTitle}: ${seriesName}`;
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

        return {
            name: seriesName,
            type: 'area',
            stackId: graph.stack,
            stacking,
            color: graph.color,
            nullMode: graph.connectNulls ? 'connect' : 'skip',
            tooltip,
            data: graph.data.reduce(
                (acc: ExtendedLineSeriesData[], item: PreparedAreaPoint, index: number) => {
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
                    const dataItem: ExtendedLineSeriesData = {
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
            },
            custom: {
                ...graph.custom,
                exportSettings,
                colorValue: graph.colorValue,
                shapeValue: graph.shapeValue,
            },
            yAxis: graph.yAxis,
        };
    });

    const shouldUseHtmlForLegend = isHtmlField(colorItem);
    const legend: ChartData['legend'] = {html: shouldUseHtmlForLegend};
    const nonEmptyLegendGroups = Array.from(
        new Set(seriesData.map((s) => s.legend?.groupId).filter(Boolean)),
    );
    if (seriesData.length <= 1 || nonEmptyLegendGroups.length <= 1) {
        legend.enabled = false;
    }

    let xAxis: ChartData['xAxis'] = {};
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
        }
    }

    const axisLabelNumberFormat = yPlaceholder
        ? getAxisFormatting({
              placeholder: yPlaceholder,
              visualizationId,
          })
        : undefined;

    const config: ChartData = {
        series: {
            data: seriesData as ChartSeries[],
        },
        xAxis,
        yAxis: segments.map((d) => {
            const baseConfig = getYAxisBaseConfig({
                placeholder: yPlaceholder,
            });
            let axisTitle: ChartYAxis['title'] | null = null;
            if (isSplitEnabled) {
                let titleText: string = d.title;
                if (isSplitWithHtmlValues) {
                    // @ts-ignore There may be a type mismatch due to the wrapper over html, markup and markdown
                    titleText = wrapHtml(d.title);
                }

                axisTitle = {
                    text: titleText,
                    rotation: 0,
                    maxWidth: '25%',
                    html: isSplitWithHtmlValues,
                };
            }

            return merge(baseConfig, {
                lineColor: 'transparent',
                labels: {
                    numberFormat: axisLabelNumberFormat ?? undefined,
                },
                plotIndex: d.index,
                title: axisTitle,
                startOnTick: isSplitEnabled,
                endOnTick: isSplitEnabled,
            });
        }),
        legend,
    };

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
        config.tooltip = {
            valueFormat: getFieldFormatOptions({field: yFields[0]}),
        };
    }

    return merge(
        getBaseChartConfig({
            shared,
            visualization: {placeholders, id: visualizationId},
        }),
        config,
    );
}
