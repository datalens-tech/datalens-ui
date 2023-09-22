import _isEmpty from 'lodash/isEmpty';

import {
    ChartkitHandlers,
    MINIMUM_FRACTION_DIGITS,
    PlaceholderId,
    ServerPlaceholder,
    Shared,
    WizardVisualizationId,
    getAxisMode,
    getFakeTitleOrTitle,
    getIsNavigatorEnabled,
    isDateField,
    isDimensionField,
    isMeasureField,
    isMeasureNameOrValue,
    isMeasureValue,
    isVisualizationWithLayers,
} from '../../../../../../../shared';
import {getGradientStops} from '../../utils/color-helpers';
import {getFieldExportingOptions} from '../../utils/export-helpers';
import {isNumericalDataType} from '../../utils/misc-helpers';
import {
    getSegmentsIndexInOrder,
    getSegmentsMap,
    getSegmentsYAxis,
    getSortedSegmentsList,
} from '../line/helpers';
import {getAxisFormattingByField} from '../line/helpers/axis/getAxisFormattingByField';
import {getLayerPlaceholderWithItems} from '../line/helpers/axis/getLayerPlaceholderWithItems';
import {PrepareFunctionArgs} from '../types';

import {prepareBarX} from './prepareBarX';

// eslint-disable-next-line complexity
export function prepareHighchartsBarX(args: PrepareFunctionArgs) {
    const {
        ChartEditor,
        placeholders,
        resultData,
        colors,
        colorsConfig,
        sort,
        idToTitle,
        idToDataType,
        visualizationId,
        shared,
        layerSettings,
        segments,
    } = args;
    const {data, order} = resultData;

    const preparedData = prepareBarX(args);
    const {graphs} = preparedData;

    const xPlaceholder = placeholders.find((p) => p.id === PlaceholderId.X);
    const x = xPlaceholder?.items[0];
    const xDataType = x ? idToDataType[x.guid] : null;
    const xIsNumber = Boolean(xDataType && isNumericalDataType(xDataType));
    const xIsFloat = x ? xDataType === 'float' : null;
    const xIsDate = Boolean(xDataType && isDateField({data_type: xDataType}));

    const xPlaceholderSettings = xPlaceholder?.settings;
    const xAxisMode = getAxisMode(xPlaceholderSettings, x?.guid);
    const isXDiscrete = xAxisMode === 'discrete';

    const x2 = placeholders[0].items[1];

    const yPlaceholder = placeholders.find((p) => p.id === PlaceholderId.Y);
    const yFields = yPlaceholder?.items || [];

    const colorItem = colors[0];

    const sortItem = sort?.[0];
    const isSortItemExists = Boolean(sort && sort.length);
    const sortXItem = sort.find((s) => x && s.guid === x.guid);

    const isColorizeByMeasure = isMeasureField(colorItem);
    const isColorizeByMeasureValue = isMeasureValue(colorItem);

    const segmentField = segments[0];
    const segmentIndexInOrder = getSegmentsIndexInOrder(order, segmentField, idToTitle);
    const segmentsList = getSortedSegmentsList({
        sortItem,
        segmentField,
        segmentIndexInOrder,
        data,
        idToDataType,
    });
    const segmentsMap = getSegmentsMap({
        segments: segmentsList,
        y2SectionItems: [],
    });
    const isSegmentsExists = !_isEmpty(segmentsMap);

    // Here we manage the highcharts settings depending on the parameters
    if (ChartEditor) {
        if (yFields.length) {
            const isYSectionHasFloatItem = yFields.some((y) => y.data_type === 'float');
            if (isYSectionHasFloatItem) {
                ChartEditor.updateConfig({
                    precision: MINIMUM_FRACTION_DIGITS,
                });
            }

            const customConfig: any = {
                xAxis: {},
                plotOptions: {},
                axesFormatting: {xAxis: [], yAxis: []},
                exporting: {
                    csv: {
                        custom: {
                            categoryHeader: getFieldExportingOptions(x),
                        },
                        columnHeaderFormatter: ChartkitHandlers.WizardExportColumnNamesFormatter,
                    },
                },
            };

            if (xPlaceholder?.settings?.axisFormatMode === 'by-field') {
                customConfig.axesFormatting.xAxis.push(
                    getAxisFormattingByField(xPlaceholder, visualizationId),
                );
            }

            const visualization = shared.visualization as Shared['visualization'];

            let layerYPlaceholder;
            let layerY2Placeholder;

            if (isVisualizationWithLayers(visualization)) {
                const lastLayer = visualization.layers[visualization.layers.length - 1];

                if (lastLayer.layerSettings.id === layerSettings.id) {
                    layerYPlaceholder = yPlaceholder;
                    layerY2Placeholder = undefined;

                    if (!layerYPlaceholder || !layerYPlaceholder.items.length) {
                        layerYPlaceholder = getLayerPlaceholderWithItems(
                            shared.visualization,
                            PlaceholderId.Y,
                            {isFirstFromTheTop: true},
                        );
                    }

                    layerY2Placeholder = getLayerPlaceholderWithItems(
                        shared.visualization,
                        PlaceholderId.Y2,
                        {isFirstFromTheTop: true},
                    );
                }
            } else {
                layerYPlaceholder = yPlaceholder;
                layerY2Placeholder = undefined;
            }

            if (
                layerYPlaceholder &&
                layerYPlaceholder.settings?.axisFormatMode === 'by-field' &&
                !isSegmentsExists
            ) {
                customConfig.axesFormatting.yAxis.push(
                    getAxisFormattingByField(layerYPlaceholder, visualizationId),
                );
            }

            if (
                layerY2Placeholder &&
                layerY2Placeholder.settings?.axisFormatMode === 'by-field' &&
                !isSegmentsExists
            ) {
                customConfig.axesFormatting.yAxis.push(
                    getAxisFormattingByField(layerY2Placeholder, visualizationId),
                );
            }

            const isLegendEnabled = shared.extraSettings?.legendMode !== 'hide';

            const isCombinedChartColorizedBySomeDimenstion =
                shared.visualization.id === 'combined-chart' &&
                shared.visualization.layers?.some((layer) => {
                    return layer.commonPlaceholders.colors.some((field) => isDimensionField(field));
                });

            const isShouldShowMeasureLegend =
                (isColorizeByMeasure || isColorizeByMeasureValue) &&
                !isCombinedChartColorizedBySomeDimenstion;

            if (isShouldShowMeasureLegend) {
                const points: Highcharts.PointOptionsObject[] = (graphs as any[]).reduce(
                    (acc: Highcharts.PointOptionsObject[], graph) => [...acc, ...graph.data],
                    [],
                );
                const colorValues = points
                    .map((point) => point.colorValue)
                    .filter((cv): cv is number => Boolean(cv));

                const minColorValue = Math.min(...colorValues);
                const maxColorValue = Math.max(...colorValues);

                customConfig.colorAxis = {
                    startOnTick: false,
                    endOnTick: false,
                    min: minColorValue,
                    max: maxColorValue,
                    stops: getGradientStops(colorsConfig, points, minColorValue, maxColorValue),
                };
                customConfig.legend = {
                    title: {
                        text: getFakeTitleOrTitle(colorItem),
                    },
                    enabled: isLegendEnabled,
                    symbolWidth: null,
                };
                customConfig.plotOptions = {
                    bar: {
                        borderWidth: 1,
                    },
                    column: {
                        borderWidth: 1,
                    },
                };
            }

            if (xIsDate || xIsNumber) {
                if (
                    isSortItemExists &&
                    sortXItem &&
                    (sortXItem.direction === 'DESC' || !sortXItem.direction)
                ) {
                    if (
                        visualizationId === WizardVisualizationId.Bar ||
                        visualizationId === WizardVisualizationId.Bar100p
                    ) {
                        // It turns out that in order to expand the X-axis for a Bar chart in Highcharts, you need to pass false
                        // While in all other types of charts you need to pass true
                        customConfig.xAxis.reversed = false;
                    } else {
                        customConfig.xAxis.reversed = true;
                    }
                }

                if (
                    isXDiscrete &&
                    xPlaceholderSettings &&
                    xPlaceholderSettings.type !== 'logarithmic'
                ) {
                    customConfig.xAxis.type = 'category';
                    if (xIsDate) {
                        customConfig.xAxis.labels = {
                            formatter: ChartkitHandlers.WizardXAxisFormatter,
                        };
                    }
                } else if (xIsDate) {
                    customConfig.xAxis.type = 'datetime';
                }

                if (x && getIsNavigatorEnabled(shared)) {
                    ChartEditor.updateConfig({
                        // For old charts. In the new charts, we put the navigator settings in navigatorSettings and
                        // adding to the config in config.ts
                        highstock: {
                            base_series_name: shared.extraSettings?.navigatorSeriesName,
                        },
                    });
                }
            }

            if (getIsNavigatorEnabled(shared)) {
                customConfig.xAxis.ordinal = isXDiscrete;
            }

            if (shared.extraSettings) {
                const {tooltipSum} = shared.extraSettings;

                if (typeof tooltipSum === 'undefined' || tooltipSum === 'on') {
                    customConfig.enableSum = true;
                }
            }

            if (x && !isMeasureNameOrValue(x)) {
                const fieldTitle = getFakeTitleOrTitle(x);
                customConfig.tooltipHeaderFormatter = fieldTitle;
            }

            if (isSegmentsExists) {
                customConfig.legend = {
                    enabled: Boolean(colorItem || x2 || yFields.length > 1) && isLegendEnabled,
                };

                const {yAxisFormattings, yAxisSettings} = getSegmentsYAxis(
                    segmentsMap,
                    {
                        y: yPlaceholder as ServerPlaceholder,
                        y2: undefined as unknown as ServerPlaceholder,
                    },
                    visualizationId,
                );
                customConfig.yAxis = yAxisSettings;
                customConfig.axesFormatting.yAxis = yAxisFormattings;
            }

            ChartEditor.updateHighchartsConfig(customConfig);
        } else {
            const customConfig: any = {xAxis: {}};

            if (xIsDate || xIsNumber) {
                if (
                    isSortItemExists &&
                    sortXItem &&
                    (sortXItem.direction === 'DESC' || !sortXItem.direction)
                ) {
                    customConfig.xAxis.reversed = true;
                }

                if (xIsDate) {
                    if (xAxisMode === 'discrete') {
                        customConfig.xAxis.labels = {
                            formatter: ChartkitHandlers.WizardXAxisFormatter,
                        };
                    } else {
                        customConfig.xAxis.type = 'datetime';
                    }
                } else if (!xIsFloat) {
                    customConfig.xAxis.type = 'category';
                }
            }

            ChartEditor.updateHighchartsConfig(customConfig);
        }
    }

    return preparedData;
}
