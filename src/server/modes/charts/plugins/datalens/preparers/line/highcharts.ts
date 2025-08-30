import _isEmpty from 'lodash/isEmpty';
import set from 'lodash/set';

import type {Field, ServerField, WizardVisualizationId} from '../../../../../../../shared';
import {
    AxisLabelFormatMode,
    AxisMode,
    ChartkitHandlers,
    MINIMUM_FRACTION_DIGITS,
    PlaceholderId,
    getAxisMode,
    getFakeTitleOrTitle,
    getIsNavigatorEnabled,
    getXAxisMode,
    isDateField,
    isFloatField,
    isMeasureNameOrValue,
    isVisualizationWithSeveralFieldsXPlaceholder,
} from '../../../../../../../shared';
import {isHtmlField} from '../../../../../../../shared/types/index';
import {getConfigWithActualFieldTypes} from '../../utils/config-helpers';
import {getFieldExportingOptions} from '../../utils/export-helpers';
import {isLegendEnabled} from '../../utils/misc-helpers';
import {addAxisFormatter, addAxisFormatting, getAxisFormatting, getAxisType} from '../helpers/axis';
import {
    getHighchartsColorAxis,
    isXAxisReversed,
    shouldUseGradientLegend,
} from '../helpers/highcharts';
import {getYPlaceholders} from '../helpers/layers';
import {getSegmentMap} from '../helpers/segments';
import type {PrepareFunctionArgs} from '../types';

import {getSegmentsYAxis} from './helpers';
import {prepareLineData} from './prepare-line-data';

// eslint-disable-next-line complexity
function getHighchartsConfig(args: PrepareFunctionArgs & {graphs: any[]}) {
    const {
        placeholders,
        colors,
        colorsConfig,
        sort,
        visualizationId,
        shared,
        shapes,
        graphs,
        segments,
        idToDataType,
    } = args;
    const xPlaceholder = placeholders.find((p) => p.id === PlaceholderId.X);
    const xPlaceholderSettings = xPlaceholder?.settings;
    const x: ServerField | undefined = xPlaceholder?.items[0];
    const isXDiscrete = getAxisMode(xPlaceholderSettings, x?.guid) === AxisMode.Discrete;
    const x2 = isVisualizationWithSeveralFieldsXPlaceholder(visualizationId)
        ? xPlaceholder?.items[1]
        : undefined;
    const yPlaceholder = placeholders.find((p) => p.id === PlaceholderId.Y);
    const y2Placeholder = placeholders.find((p) => p.id === PlaceholderId.Y2);
    const ySectionItems = yPlaceholder?.items || [];
    const y2SectionItems = y2Placeholder?.items || [];
    const mergedYSections = [...ySectionItems, ...y2SectionItems];
    const colorItem = colors[0];
    const shapeItem = shapes[0];
    const segment = segments[0];
    const segmentsMap = getSegmentMap(args);

    const xField = x ? ({guid: x.guid, data_type: idToDataType[x.guid]} as Field) : x;
    const chartConfig = getConfigWithActualFieldTypes({config: shared, idToDataType});
    const xAxisMode = getXAxisMode({config: chartConfig});
    const xAxisType = getAxisType({
        field: xField,
        settings: xPlaceholder?.settings,
        axisMode: xAxisMode,
    });

    const wizardXAxisFormatter =
        isDateField(x) && xAxisType === 'category'
            ? ChartkitHandlers.WizardXAxisFormatter
            : undefined;

    const customConfig: any = {
        xAxis: {
            type: xAxisType,
            reversed: isXAxisReversed(x, sort, visualizationId as WizardVisualizationId),
            labels: {
                useHTML: isHtmlField(x),
            },
        },
        yAxis: {},
        axesFormatting: {
            xAxis: [],
            yAxis: [],
        },
        exporting: {
            csv: {
                custom: {
                    categoryHeader: getFieldExportingOptions(x),
                },
                columnHeaderFormatter: ChartkitHandlers.WizardExportColumnNamesFormatter,
            },
        },
    };

    addAxisFormatting(customConfig.axesFormatting.xAxis, visualizationId, xPlaceholder);
    addAxisFormatter({
        axisConfig: customConfig.xAxis,
        placeholder: xPlaceholder,
        otherwiseFormatter: wizardXAxisFormatter,
        chartConfig,
    });

    if (mergedYSections.length) {
        if (shouldUseGradientLegend(colorItem, colorsConfig, shared)) {
            customConfig.colorAxis = getHighchartsColorAxis(graphs, colorsConfig);
            customConfig.legend = {
                title: {
                    text: getFakeTitleOrTitle(colorItem),
                },
                enabled: isLegendEnabled(shared.extraSettings),
                symbolWidth: null,
            };
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
            customConfig.tooltipHeaderFormatter = getFakeTitleOrTitle(x);
        }

        if (_isEmpty(segmentsMap)) {
            const [layerYPlaceholder, layerY2Placeholder] = getYPlaceholders(args);

            addAxisFormatting(
                customConfig.axesFormatting.yAxis,
                visualizationId,
                layerYPlaceholder,
            );

            const formatMode = layerY2Placeholder?.settings?.axisFormatMode;
            if (formatMode && formatMode !== AxisLabelFormatMode.Auto) {
                const formatting = getAxisFormatting(layerY2Placeholder, visualizationId);
                if (formatting) {
                    if (customConfig.axesFormatting.yAxis.length === 0) {
                        customConfig.axesFormatting.yAxis.push({});
                    }

                    customConfig.axesFormatting.yAxis.push(formatting);
                }
            }

            if (layerYPlaceholder?.items.length && layerY2Placeholder?.items.length) {
                const y1 = {};
                const y2 = {};
                addAxisFormatter({
                    axisConfig: y1,
                    placeholder: layerYPlaceholder,
                });
                addAxisFormatter({
                    axisConfig: y2,
                    placeholder: layerY2Placeholder,
                });
                customConfig.yAxis = [y1, y2];
            } else if (layerYPlaceholder?.items.length) {
                addAxisFormatter({
                    axisConfig: customConfig.yAxis,
                    placeholder: layerYPlaceholder,
                });
            } else {
                addAxisFormatter({
                    axisConfig: customConfig.yAxis,
                    placeholder: layerY2Placeholder,
                });
            }
        } else {
            customConfig.legend = {
                enabled:
                    Boolean(
                        colorItem ||
                            shapeItem ||
                            x2 ||
                            ySectionItems.length > 1 ||
                            y2SectionItems.length > 1,
                    ) && isLegendEnabled(shared.extraSettings),
            };

            const {yAxisFormattings, yAxisSettings} = getSegmentsYAxis({
                segment,
                segmentsMap,
                placeholders: {
                    y: yPlaceholder,
                    y2: y2Placeholder,
                },
                visualizationId,
            });
            customConfig.yAxis = yAxisSettings;
            customConfig.axesFormatting.yAxis = yAxisFormattings;
        }
    }

    const shouldUseHtmlForLegend = [colorItem, shapeItem].some(isHtmlField);
    if (shouldUseHtmlForLegend) {
        set(customConfig, 'legend.useHTML', true);
    }

    return customConfig;
}

function getConfig(args: PrepareFunctionArgs) {
    const {placeholders, shared} = args;
    const config: any = {};

    const xFields = placeholders.find((p) => p.id === PlaceholderId.X)?.items || [];
    if (xFields.some(Boolean) && getIsNavigatorEnabled(shared)) {
        // For old charts. In the new charts, we put the navigator settings in navigatorSettings and
        // adding to the config in config.ts
        config.highstock = {
            base_series_name: shared.extraSettings?.navigatorSeriesName,
        };
    }

    const yFields = placeholders.find((p) => p.id === PlaceholderId.Y)?.items || [];
    const y2Fields = placeholders.find((p) => p.id === PlaceholderId.Y2)?.items || [];
    const hasFloatYFields = yFields.some(isFloatField) || y2Fields.some(isFloatField);
    if (hasFloatYFields) {
        config.precision = MINIMUM_FRACTION_DIGITS;
    }

    return config;
}

export function prepareHighchartsLine(args: PrepareFunctionArgs) {
    const {ChartEditor} = args;

    const preparedData = prepareLineData(args);

    if (ChartEditor) {
        const highchartsConfig = getHighchartsConfig({
            ...args,
            graphs: preparedData.graphs,
        });
        ChartEditor.updateHighchartsConfig(highchartsConfig);

        const config = getConfig(args);
        ChartEditor.updateConfig(config);
    }

    return preparedData;
}
