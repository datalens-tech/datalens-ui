import type {
    BarXSeries,
    BarXSeriesData,
    ChartData,
    ChartSeries,
} from '@gravity-ui/chartkit/gravity-charts';
import merge from 'lodash/merge';
import sortBy from 'lodash/sortBy';

import type {
    SeriesExportSettings,
    ServerField,
    WizardVisualizationId,
    WrappedMarkdown,
} from '../../../../../../../shared';
import {
    AxisMode,
    GradientType,
    LabelsPositions,
    PERCENT_VISUALIZATIONS,
    PlaceholderId,
    getFakeTitleOrTitle,
    getIsNavigatorEnabled,
    getRgbColorValue,
    getXAxisMode,
    isDateField,
    isHtmlField,
    isMarkdownField,
    isMarkupField,
    isNumberField,
    transformHexToRgb,
} from '../../../../../../../shared';
import type {WrappedHTML} from '../../../../../../../shared/types/charts';
import {getBaseChartConfig, getYAxisBaseConfig} from '../../gravity-charts/utils';
import {getFieldFormatOptions} from '../../gravity-charts/utils/format';
import {getSeriesRangeSliderConfig} from '../../gravity-charts/utils/range-slider';
import {getRgbColors} from '../../utils/color-helpers';
import {getConfigWithActualFieldTypes} from '../../utils/config-helpers';
import {getExportColumnSettings} from '../../utils/export-helpers';
import {isGradientMode} from '../../utils/misc-helpers';
import {getAxisFormatting, getAxisType, getYAxisPlaceholders} from '../helpers/axis';
import {DATA_LABEL_DEFAULT_PADDING} from '../helpers/axis/data-labels';
import {isXAxisReversed} from '../helpers/highcharts';
import {getLegendColorScale, shouldUseGradientLegend} from '../helpers/legend';
import {getSegmentMap} from '../helpers/segments';
import type {PrepareFunctionArgs} from '../types';
import {
    mapChartkitFormatSettingsToGravityChartValueFormat,
    mapToGravityChartValueFormat,
} from '../utils';

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
        sort,
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
    const preparedCategories = preparedData.categories ?? preparedData.categories_ms;
    const xCategories = xField ? preparedCategories : yField ? [getFakeTitleOrTitle(yField)] : [];

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

    const isGradient =
        Boolean(colorItem) &&
        isGradientMode({
            colorField: colorItem,
            colorFieldDataType: colorItem.data_type,
            colorsConfig,
        });

    const shouldUseHtmlForLabels =
        isMarkupField(labelField) || isHtmlField(labelField) || isMarkdownField(labelField);
    const shouldUsePercentStacking = PERCENT_VISUALIZATIONS.has(visualizationId);
    const inNavigatorEnabled = getIsNavigatorEnabled(shared);

    let seriesTooltip: BarXSeries['tooltip'];
    if (!yField) {
        seriesTooltip = {enabled: false};
    }

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

        const labelFormatting = graph.dataLabels
            ? mapToGravityChartValueFormat({field: labelField, formatSettings: graph.dataLabels})
            : undefined;
        const shouldUsePercentageAsLabel =
            labelFormatting &&
            'labelMode' in labelFormatting &&
            labelFormatting?.labelMode === 'percent';

        let seriesColor = graph.color;
        if (!seriesColor && isGradient) {
            const points = preparedData.graphs
                .map((currentGraph) =>
                    (currentGraph.data ?? []).map((d: OldBarXDataItem) => ({
                        colorValue: d?.colorValue,
                    })),
                )
                .flat(2);
            const colorScale = getLegendColorScale({
                colorsConfig,
                points,
            });
            const gradientColors = getRgbColors(colorScale.colors.map(transformHexToRgb), false);
            seriesColor = getRgbColorValue(0.5, GradientType.TWO_POINT, 0.5, [
                gradientColors[0],
                gradientColors[gradientColors.length - 1],
            ]);
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
            type: 'bar-x',
            color: seriesColor,
            stackId: graph.stack,
            stacking: shouldUsePercentStacking ? 'percent' : 'normal',
            tooltip,
            data: graph.data.reduce(
                (acc: ExtendedBaXrSeriesData[], item: OldBarXDataItem, index: number) => {
                    const pointX = item?.x;
                    const total =
                        preparedData.graphs.reduce(
                            (sum, currentGraph) =>
                                sum +
                                (currentGraph.data.find(
                                    (point: OldBarXDataItem) => point?.x === pointX,
                                )?.y ?? 0),
                            0,
                        ) ?? 0;
                    const percentage = ((item?.y ?? 0) / total) * 100;
                    const label = shouldUsePercentageAsLabel ? percentage : item?.label;
                    const dataItem: ExtendedBaXrSeriesData = {
                        y: item?.y ?? 0,
                        custom: item?.custom,
                        color: item?.color,
                    };

                    if (isDataLabelsEnabled) {
                        if (item?.y === null) {
                            dataItem.label = '';
                        } else {
                            dataItem.label = label;
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
                enabled: yField ? undefined : false,
            },
            custom: {...graph.custom, colorValue: graph.colorValue, exportSettings},
            dataLabels: {
                enabled: isDataLabelsEnabled,
                inside: shared.extraSettings?.labelsPosition !== LabelsPositions.Outside,
                html: shouldUseHtmlForLabels,
                format: labelFormatting,
                padding: DATA_LABEL_DEFAULT_PADDING,
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
    }

    let xAxis: ChartData['xAxis'] = {
        startOnTick: false,
        endOnTick: false,
    };

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

            if (xAxis.type === 'logarithmic') {
                xAxis.startOnTick = true;
                xAxis.endOnTick = true;
            }
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

    if (xAxis && isXAxisReversed(xField, sort, visualizationId as WizardVisualizationId)) {
        xAxis.order = 'reverse';
    }

    const segmentField = split?.[0];
    const segmentsMap = getSegmentMap(args);
    const segments = sortBy(Object.values(segmentsMap), (s) => s.index);
    const isSplitEnabled = Boolean(segmentField);
    const isSplitWithHtmlValues = isHtmlField(segmentField);

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
    };

    const chartYAxisItems = getYAxisPlaceholders({placeholders, shared});
    const chartYAxisPlaceholder = chartYAxisItems.find((p) => p.id === PlaceholderId.Y);
    const yAxisBaseConfig = merge(
        getYAxisBaseConfig({
            placeholder: chartYAxisPlaceholder,
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
                text: titleText,
                rotation: 0,
                maxWidth: '25%',
                html: isSplitWithHtmlValues,
            };

            return merge(yAxisBaseConfig, {
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

    if (yField) {
        config.tooltip = {
            valueFormat: getFieldFormatOptions({field: yField}),
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
