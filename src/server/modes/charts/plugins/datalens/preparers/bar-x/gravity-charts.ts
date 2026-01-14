import type {
    BarXSeries,
    BarXSeriesData,
    ChartData,
    ChartSeries,
    ChartYAxis,
} from '@gravity-ui/chartkit/gravity-charts';
import merge from 'lodash/merge';
import sortBy from 'lodash/sortBy';

import type {SeriesExportSettings, ServerField, WrappedMarkdown} from '../../../../../../../shared';
import {
    AxisMode,
    LabelsPositions,
    PERCENT_VISUALIZATIONS,
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
import type {WrappedHTML} from '../../../../../../../shared/types/charts';
import {getBaseChartConfig, getYAxisBaseConfig} from '../../gravity-charts/utils';
import {getFormattedLabel} from '../../gravity-charts/utils/dataLabels';
import {getFieldFormatOptions} from '../../gravity-charts/utils/format';
import {getSeriesRangeSliderConfig} from '../../gravity-charts/utils/range-slider';
import {getConfigWithActualFieldTypes} from '../../utils/config-helpers';
import {getExportColumnSettings} from '../../utils/export-helpers';
import {getAxisFormatting, getAxisType} from '../helpers/axis';
import {getLegendColorScale, shouldUseGradientLegend} from '../helpers/legend';
import {getSegmentMap} from '../helpers/segments';
import type {PrepareFunctionArgs} from '../types';

import {prepareBarX} from './prepare-bar-x';

type OldBarXDataItem = {
    y: number;
    x?: number;
    label?: string | number;
    custom?: any;
    color?: string;
    colorValue?: number;
} | null;

type ExtendedBaXrSeriesData = Omit<BarXSeriesData, 'x'> & {
    x?: BarXSeriesData['x'] | WrappedHTML | WrappedMarkdown;
};

type ExtendedBarXSeries = Omit<BarXSeries, 'data'> & {
    custom?: {
        exportSettings?: SeriesExportSettings;
        colorValue?: string;
    };
    data: ExtendedBaXrSeriesData[];
};

// eslint-disable-next-line complexity
export function prepareGravityChartBarX(args: PrepareFunctionArgs) {
    const {
        shared,
        labels,
        placeholders,
        disableDefaultSorting = false,
        idToDataType,
        colors,
        colorsConfig,
        visualizationId,
        segments: split,
    } = args;
    const xPlaceholder = placeholders.find((p) => p.id === PlaceholderId.X);
    const xField: ServerField | undefined = xPlaceholder?.items?.[0];
    const yPlaceholder = placeholders.find((p) => p.id === PlaceholderId.Y);
    const yField: ServerField | undefined = yPlaceholder?.items?.[0];
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

    if (!xField && !yField) {
        return {
            series: {
                data: [],
            },
        };
    }

    const preparedData = prepareBarX(args);
    const xCategories = xField
        ? preparedData.categories
        : yField
          ? [getFakeTitleOrTitle(yField)]
          : [];

    const exportSettings: SeriesExportSettings = {
        columns: [
            getExportColumnSettings({path: isCategoriesXAxis ? 'category' : 'x', field: xField}),
            getExportColumnSettings({path: 'y', field: yField}),
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
    const inNavigatorEnabled = getIsNavigatorEnabled(shared);
    const seriesData = preparedData.graphs.map<ExtendedBarXSeries>((graph) => {
        const rangeSlider = inNavigatorEnabled
            ? getSeriesRangeSliderConfig({
                  extraSettings: shared.extraSettings,
                  seriesName: graph.title,
              })
            : undefined;
        const seriesName = graph.custom?.segmentTitle
            ? `${graph.custom.segmentTitle}: ${graph.title}`
            : graph.title;

        return {
            name: seriesName,
            type: 'bar-x',
            color: graph.color,
            stackId: graph.stack,
            stacking: shouldUsePercentStacking ? 'percent' : 'normal',
            data: graph.data.reduce(
                (acc: ExtendedBaXrSeriesData[], item: OldBarXDataItem, index: number) => {
                    const dataItem: ExtendedBaXrSeriesData = {
                        y: item?.y || 0,
                        custom: item?.custom,
                        color: item?.color,
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
                },
                [],
            ),
            legend: {
                groupId: graph.id,
                itemText: graph.legendTitle,
            },
            custom: {...graph.custom, colorValue: graph.colorValue, exportSettings},
            dataLabels: {
                enabled: isDataLabelsEnabled,
                inside: shared.extraSettings?.labelsPosition !== LabelsPositions.Outside,
                html: shouldUseHtmlForLabels,
            },
            yAxis: graph.yAxis,
            rangeSlider,
        };
    });

    let legend: ChartData['legend'];
    if (seriesData.length && shouldUseGradientLegend(colorItem, colorsConfig, shared)) {
        const points = preparedData.graphs
            .map((graph) =>
                (graph.data ?? []).map((d: OldBarXDataItem) => ({colorValue: d?.colorValue})),
            )
            .flat(2);

        const colorScale = getLegendColorScale({
            colorsConfig,
            points,
        });

        legend = {
            enabled: shared.extraSettings?.legendMode !== 'hide',
            type: 'continuous',
            title: {text: getFakeTitleOrTitle(colorItem), style: {fontWeight: '500'}},
            colorScale,
        };
    } else {
        const shouldUseHtmlForLegend = isHtmlField(colorItem);
        legend = {html: shouldUseHtmlForLegend};

        const nonEmptyLegendGroups = Array.from(
            new Set(seriesData.map((s) => s.legend?.groupId).filter(Boolean)),
        );
        if (seriesData.length <= 1 || nonEmptyLegendGroups.length <= 1) {
            legend.enabled = false;
        }
    }

    let xAxis: ChartData['xAxis'] = {};
    if (isCategoriesXAxis && xCategories?.length) {
        xAxis = {
            type: 'category',
            // @ts-ignore There may be a type mismatch due to the wrapper over html, markup and markdown
            categories: xCategories.map((category) => {
                if (typeof category === 'number') {
                    return String(category);
                }

                return category;
            }),
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

        const xAxisLabelNumberFormat = xPlaceholder
            ? getAxisFormatting({
                  placeholder: xPlaceholder,
                  visualizationId,
              })
            : undefined;

        if (xAxisLabelNumberFormat) {
            xAxis.labels = {numberFormat: xAxisLabelNumberFormat};
        }
    }

    const segmentsMap = getSegmentMap(args);
    const segments = sortBy(Object.values(segmentsMap), (s) => s.index);
    const isSplitEnabled = new Set(segments.map((d) => d.index)).size > 1;
    const isSplitWithHtmlValues = isHtmlField(split?.[0]);

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
        legend,
        xAxis,
        yAxis: segments.map((d) => {
            const axisBaseConfig = getYAxisBaseConfig({
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

            return merge(axisBaseConfig, {
                labels: {
                    numberFormat: axisLabelNumberFormat ?? undefined,
                },
                plotIndex: d.index,
                title: axisTitle,
            });
        }),
        split: {
            enable: isSplitEnabled,
            gap: '40px',
            plots: segments.map(() => {
                return {};
            }),
        },
    };

    if (yField) {
        config.tooltip = {
            valueFormat: getFieldFormatOptions({field: yField}),
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
