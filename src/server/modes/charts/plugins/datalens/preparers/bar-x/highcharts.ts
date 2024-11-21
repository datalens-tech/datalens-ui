import _isEmpty from 'lodash/isEmpty';

import type {ServerPlaceholder, WizardVisualizationId} from '../../../../../../../shared';
import {
    AxisLabelFormatMode,
    AxisMode,
    ChartkitHandlers,
    MINIMUM_FRACTION_DIGITS,
    PlaceholderId,
    getFakeTitleOrTitle,
    getIsNavigatorEnabled,
    getXAxisMode,
    isDateField,
    isMeasureNameOrValue,
} from '../../../../../../../shared';
import {getConfigWithActualFieldTypes} from '../../utils/config-helpers';
import {getFieldExportingOptions} from '../../utils/export-helpers';
import {isLegendEnabled, isNumericalDataType} from '../../utils/misc-helpers';
import {
    getHighchartsColorAxis,
    isXAxisReversed,
    shouldUseGradientLegend,
} from '../helpers/highcharts';
import {getYPlaceholders} from '../helpers/layers';
import {getSegmentMap} from '../helpers/segments';
import {getSegmentsYAxis} from '../line/helpers';
import {getAxisFormattingByField} from '../line/helpers/axis/getAxisFormattingByField';
import type {PrepareFunctionArgs} from '../types';

import {prepareBarX} from './prepare-bar-x';

// eslint-disable-next-line complexity
export function prepareHighchartsBarX(args: PrepareFunctionArgs) {
    const {
        ChartEditor,
        placeholders,
        colors,
        colorsConfig,
        sort,
        idToDataType,
        visualizationId,
        shared,
    } = args;
    const preparedData = prepareBarX(args);
    const {graphs} = preparedData;

    const xPlaceholder = placeholders.find((p) => p.id === PlaceholderId.X);
    const x = xPlaceholder?.items[0];
    const xDataType = x ? idToDataType[x.guid] : null;
    const xIsNumber = Boolean(xDataType && isNumericalDataType(xDataType));
    const xIsFloat = x ? xDataType === 'float' : null;
    const xIsDate = Boolean(xDataType && isDateField({data_type: xDataType}));
    const xPlaceholderSettings = xPlaceholder?.settings;
    let xAxisMode = AxisMode.Discrete;
    if (x && xDataType) {
        const chartConfig = getConfigWithActualFieldTypes({config: shared, idToDataType});
        xAxisMode = getXAxisMode({config: chartConfig}) ?? AxisMode.Discrete;
    }

    const isXDiscrete = xAxisMode === AxisMode.Discrete;
    const x2 = placeholders[0].items[1];
    const yPlaceholder = placeholders.find((p) => p.id === PlaceholderId.Y);
    const yFields = yPlaceholder?.items || [];
    const colorItem = colors[0];
    const segmentsMap = getSegmentMap(args);
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

            if (xPlaceholder?.settings?.axisFormatMode === AxisLabelFormatMode.ByField) {
                customConfig.axesFormatting.xAxis.push(
                    getAxisFormattingByField(xPlaceholder, visualizationId),
                );
            }

            const [layerYPlaceholder] = getYPlaceholders(args);

            if (
                layerYPlaceholder?.settings?.axisFormatMode === AxisLabelFormatMode.ByField &&
                !isSegmentsExists
            ) {
                customConfig.axesFormatting.yAxis.push(
                    getAxisFormattingByField(layerYPlaceholder, visualizationId),
                );
            }

            if (shouldUseGradientLegend(colorItem, colorsConfig, shared)) {
                customConfig.colorAxis = getHighchartsColorAxis(graphs, colorsConfig);
                customConfig.legend = {
                    title: {
                        text: getFakeTitleOrTitle(colorItem),
                    },
                    enabled: isLegendEnabled(shared.extraSettings),
                    symbolWidth: null,
                };
                customConfig.plotOptions = {
                    column: {
                        borderWidth: 1,
                    },
                };
            }

            if (xIsDate || xIsNumber) {
                customConfig.xAxis.reversed = isXAxisReversed(
                    x,
                    sort,
                    visualizationId as WizardVisualizationId,
                );

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
                    enabled:
                        Boolean(colorItem || x2 || yFields.length > 1) &&
                        isLegendEnabled(shared.extraSettings),
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
                customConfig.xAxis.reversed = isXAxisReversed(
                    x,
                    sort,
                    visualizationId as WizardVisualizationId,
                );

                if (xIsDate) {
                    if (xAxisMode === AxisMode.Discrete) {
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
