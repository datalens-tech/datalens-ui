import _isEmpty from 'lodash/isEmpty';
import set from 'lodash/set';

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
    isHtmlField,
    isMeasureNameOrValue,
} from '../../../../../../../shared';
import {getConfigWithActualFieldTypes} from '../../utils/config-helpers';
import {getFieldExportingOptions} from '../../utils/export-helpers';
import {isLegendEnabled, isNumericalDataType} from '../../utils/misc-helpers';
import {addAxisFormatter, addAxisFormatting} from '../helpers/axis';
import {getAxisChartkitFormatting} from '../helpers/axis/get-axis-formatting';
import {getHighchartsColorAxis, isXAxisReversed} from '../helpers/highcharts';
import {getYPlaceholders} from '../helpers/layers';
import {shouldUseGradientLegend} from '../helpers/legend';
import {getSegmentMap} from '../helpers/segments';
import {getSegmentsYAxis} from '../line/helpers';
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
        segments,
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
    const chartConfig = getConfigWithActualFieldTypes({config: shared, idToDataType});

    if (x && xDataType) {
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
        const customConfig: any = {xAxis: {}, yAxis: {}};

        if (yFields.length) {
            const isYSectionHasFloatItem = yFields.some((y) => y.data_type === 'float');
            if (isYSectionHasFloatItem) {
                ChartEditor.updateConfig({
                    precision: MINIMUM_FRACTION_DIGITS,
                });
            }

            Object.assign(customConfig, {
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
            });

            addAxisFormatting(customConfig.axesFormatting.xAxis, visualizationId, xPlaceholder);

            const [layerYPlaceholder] = getYPlaceholders(args);

            const formatMode = layerYPlaceholder?.settings?.axisFormatMode;
            if (formatMode && formatMode !== AxisLabelFormatMode.Auto && !isSegmentsExists) {
                const formatting = getAxisChartkitFormatting(layerYPlaceholder, visualizationId);
                if (formatting) {
                    customConfig.axesFormatting.yAxis.push(formatting);
                }
            }

            addAxisFormatter({
                axisConfig: customConfig.yAxis,
                placeholder: layerYPlaceholder,
            });

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

                const isXDiscreteAndNotLogarithmic =
                    isXDiscrete &&
                    xPlaceholderSettings &&
                    xPlaceholderSettings.type !== 'logarithmic';
                const wizardXAxisFormatter =
                    isXDiscreteAndNotLogarithmic && xIsDate
                        ? ChartkitHandlers.WizardXAxisFormatter
                        : undefined;

                if (isXDiscreteAndNotLogarithmic) {
                    customConfig.xAxis.type = 'category';
                } else if (xIsDate) {
                    customConfig.xAxis.type = 'datetime';
                }

                addAxisFormatter({
                    axisConfig: customConfig.xAxis,
                    placeholder: xPlaceholder,
                    otherwiseFormatter: wizardXAxisFormatter,
                    chartConfig,
                });

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

                const {yAxisFormattings, yAxisSettings} = getSegmentsYAxis({
                    segment: segments[0],
                    segmentsMap,
                    placeholders: {
                        y: yPlaceholder as ServerPlaceholder,
                        y2: undefined as unknown as ServerPlaceholder,
                    },
                    visualizationId,
                });
                customConfig.yAxis = yAxisSettings;
                customConfig.axesFormatting.yAxis = yAxisFormattings;
            }
        } else if (xIsDate || xIsNumber) {
            customConfig.xAxis.reversed = isXAxisReversed(
                x,
                sort,
                visualizationId as WizardVisualizationId,
            );

            const wizardXAxisFormatter =
                isXDiscrete && xIsDate ? ChartkitHandlers.WizardXAxisFormatter : undefined;

            if (xIsDate) {
                if (!isXDiscrete) {
                    customConfig.xAxis.type = 'datetime';
                }
            } else if (!xIsFloat) {
                customConfig.xAxis.type = 'category';
            }

            addAxisFormatter({
                axisConfig: customConfig.xAxis,
                placeholder: xPlaceholder,
                otherwiseFormatter: wizardXAxisFormatter,
                chartConfig,
            });
        }

        ChartEditor.updateHighchartsConfig(customConfig);

        const shouldUseHtmlForLegend = isHtmlField(colorItem);
        if (shouldUseHtmlForLegend) {
            set(customConfig, 'legend.useHTML', true);
        }

        const shouldUseHtmlForCategory = isHtmlField(x);
        if (shouldUseHtmlForCategory) {
            set(customConfig, 'xAxis.labels.useHTML', true);
        }
    }

    return preparedData;
}
