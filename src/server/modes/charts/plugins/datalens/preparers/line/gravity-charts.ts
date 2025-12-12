import type {
    ChartData,
    ChartSeries,
    ChartYAxis,
    LineSeries,
    LineSeriesData,
} from '@gravity-ui/chartkit/gravity-charts';
import groupBy from 'lodash/groupBy';
import merge from 'lodash/merge';
import sortBy from 'lodash/sortBy';

import type {
    SeriesExportSettings,
    ServerField,
    ServerPlaceholder,
    WrappedHTML,
    WrappedMarkdown,
} from '../../../../../../../shared';
import {
    AxisMode,
    PlaceholderId,
    getXAxisMode,
    isDateField,
    isHtmlField,
    isMarkdownField,
    isMarkupField,
    isNumberField,
} from '../../../../../../../shared';
import {getBaseChartConfig, getYAxisBaseConfig} from '../../gravity-charts/utils';
import {getFormattedLabel} from '../../gravity-charts/utils/dataLabels';
import {getFieldFormatOptions} from '../../gravity-charts/utils/format';
import {getConfigWithActualFieldTypes} from '../../utils/config-helpers';
import {getExportColumnSettings} from '../../utils/export-helpers';
import {getAxisFormatting, getAxisType} from '../helpers/axis';
import {getSegmentMap} from '../helpers/segments';
import type {PrepareFunctionArgs} from '../types';

import {prepareLineData} from './prepare-line-data';

type ExtendedLineSeriesData = Omit<LineSeriesData, 'x'> & {
    x?: LineSeriesData['x'] | WrappedHTML | WrappedMarkdown;
};

type ExtendedLineSeries = Omit<LineSeries, 'data'> & {
    custom?: {
        exportSettings?: SeriesExportSettings;
    };
    data: ExtendedLineSeriesData[];
};

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
        visualizationId,
    } = args;
    const xPlaceholder = placeholders.find((p) => p.id === PlaceholderId.X);
    const xField: ServerField | undefined = xPlaceholder?.items?.[0];
    const yPlaceholder = placeholders.find((p) => p.id === PlaceholderId.Y);
    const yFields = yPlaceholder?.items || [];
    const y2Placeholder = placeholders.find((p) => p.id === PlaceholderId.Y2);
    const y2Fields = y2Placeholder?.items || [];

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

    const yAxisItems: ServerPlaceholder[] = [];
    if (yPlaceholder && yFields.length) {
        yAxisItems.push(yPlaceholder);
    }
    if (y2Placeholder && y2Fields.length) {
        yAxisItems.push(y2Placeholder);
    }

    if (!xField || !yAxisItems.length) {
        return {
            series: {
                data: [],
            },
        };
    }

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

    const shapeItem = shapes[0];
    if (shapeItem) {
        exportSettings.columns.push(
            getExportColumnSettings({path: 'series.custom.shapeValue', field: shapeItem}),
        );
    }

    const shouldUseHtmlForLabels =
        isMarkupField(labelField) || isHtmlField(labelField) || isMarkdownField(labelField);

    const seriesData: ExtendedLineSeries[] = preparedData.graphs.map<LineSeries>((graph: any) => {
        return {
            name: graph.title,
            type: 'line',
            color: graph.color,
            data: graph.data.reduce((acc: ExtendedLineSeriesData[], item: any, index: number) => {
                const dataItem: ExtendedLineSeriesData = {
                    y: item?.y || 0,
                    custom: item.custom,
                };

                if (isDataLabelsEnabled) {
                    if (item?.y === null) {
                        dataItem.label = '';
                    } else if (shouldUseHtmlForLabels) {
                        dataItem.label = item?.label;
                    } else {
                        dataItem.label = getFormattedLabel(item?.label, labelField);
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
            }, []),
            dataLabels: {
                enabled: isDataLabelsEnabled,
                html: shouldUseHtmlForLabels,
            },
            legend: {
                symbol: {
                    width: 36,
                },
            },
            dashStyle: graph.dashStyle,
            yAxis: graph.yAxis,
            custom: {
                ...graph.custom,
                exportSettings,
                colorValue: graph.colorValue,
                shapeValue: graph.shapeValue,
            },
        };
    });

    let legend: ChartData['legend'];
    if (seriesData.length <= 1) {
        legend = {enabled: false};
    }

    let xAxis: ChartData['xAxis'] = {};
    if (isCategoriesXAxis) {
        xAxis = {
            type: 'category',
            categories: xCategories?.map(String),
        };
    } else {
        if (isDateField(xField)) {
            xAxis.type = 'datetime';
        }

        if (isNumberField(xField)) {
            xAxis.type = xPlaceholder?.settings?.type === 'logarithmic' ? 'logarithmic' : 'linear';
        }
    }

    const segmentsMap = getSegmentMap(args);
    const segments = sortBy(Object.values(segmentsMap), (s) => s.index);
    const isSplitEnabled = new Set(segments.map((d) => d.index)).size > 1;

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
            const shouldUseSegmentTitle = yAxisItems.length < 2 || !d.isOpposite;

            acc.push(
                merge(axisBaseConfig, {
                    title: shouldUseSegmentTitle ? {text: d.title} : null,
                    plotIndex: d.plotIndex,
                    labels: {
                        numberFormat: labelNumberFormat ?? undefined,
                    },
                    lineColor: 'transparent',
                    position: placeholder?.id === PlaceholderId.Y2 ? 'right' : 'left',
                }),
            );

            return acc;
        }, [] as ChartYAxis[]);
    } else {
        yAxis = yAxisItems.map((placeholder) => {
            const labelNumberFormat = placeholder
                ? getAxisFormatting({
                      placeholder,
                      visualizationId,
                  })
                : undefined;

            const axisBaseConfig = getYAxisBaseConfig({
                placeholder,
            });

            return merge(axisBaseConfig, {
                labels: {
                    numberFormat: labelNumberFormat ?? undefined,
                },
                lineColor: 'transparent',
                position: placeholder?.id === PlaceholderId.Y2 ? 'right' : 'left',
            });
        });
    }

    const config: ChartData = {
        series: {
            data: seriesData as ChartSeries[],
        },
        xAxis,
        yAxis,
        split: {
            enable: isSplitEnabled,
            gap: '40px',
            plots: Object.values(groupBy(segments, (d) => d.plotIndex)).map(() => {
                return {};
            }),
        },
        legend,
    };

    if (yFields[0]) {
        config.tooltip = {
            valueFormat: getFieldFormatOptions({field: yFields[0]}),
        };
    }

    return merge(
        getBaseChartConfig({
            extraSettings: shared.extraSettings,
            visualization: {placeholders, id: visualizationId},
        }),
        config,
    );
}
