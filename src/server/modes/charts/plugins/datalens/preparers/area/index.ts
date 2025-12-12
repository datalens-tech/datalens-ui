import type {
    AreaSeries,
    AreaSeriesData,
    ChartData,
    ChartSeries,
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
import {getBaseChartConfig, getYAxisBaseConfig} from '../../gravity-charts/utils';
import {getFormattedLabel} from '../../gravity-charts/utils/dataLabels';
import {getFieldFormatOptions} from '../../gravity-charts/utils/format';
import {getConfigWithActualFieldTypes} from '../../utils/config-helpers';
import {getExportColumnSettings} from '../../utils/export-helpers';
import {getAxisFormatting, getAxisType} from '../helpers/axis';
import {getSegmentMap} from '../helpers/segments';
import {prepareLineData} from '../line/prepare-line-data';
import type {PrepareFunctionArgs} from '../types';

type ExtendedLineSeriesData = Omit<AreaSeriesData, 'x'> & {
    x?: AreaSeriesData['x'] | WrappedHTML | WrappedMarkdown;
};

type ExtendedLineSeries = Omit<AreaSeries, 'data'> & {
    custom?: {
        exportSettings?: SeriesExportSettings;
    };
    data: ExtendedLineSeriesData[];
};

export function prepareGravityChartArea(args: PrepareFunctionArgs) {
    const {
        visualizationId,
        labels,
        placeholders,
        disableDefaultSorting = false,
        shared,
        idToDataType,
        colors,
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

    const segmentsMap = getSegmentMap(args);
    const segments = sortBy(Object.values(segmentsMap), (s) => s.index);
    const isSplitEnabled = new Set(segments.map((d) => d.index)).size > 1;

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
    const seriesData: ExtendedLineSeries[] = preparedData.graphs.map<AreaSeries>((graph: any) => {
        return {
            name: graph.title,
            type: 'area',
            stackId: graph.stack,
            stacking: shouldUsePercentStacking ? 'percent' : 'normal',
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
            legend: {
                groupId: graph.id,
            },
            dataLabels: {
                enabled: isDataLabelsEnabled,
                html: shouldUseHtmlForLabels,
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

    let legend: ChartData['legend'];
    const nonEmptyLegendGroups = Array.from(
        new Set(seriesData.map((s) => s.legend?.groupId).filter(Boolean)),
    );
    if (seriesData.length <= 1 || nonEmptyLegendGroups.length <= 1) {
        legend = {enabled: false};
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
            return merge(baseConfig, {
                lineColor: 'transparent',
                labels: {
                    numberFormat: axisLabelNumberFormat ?? undefined,
                },
                plotIndex: d.index,
                title: isSplitEnabled ? {text: d.title} : undefined,
            });
        }),
        legend,
        split: {
            enable: isSplitEnabled,
            gap: '40px',
            plots: segments.map(() => {
                return {};
            }),
        },
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
