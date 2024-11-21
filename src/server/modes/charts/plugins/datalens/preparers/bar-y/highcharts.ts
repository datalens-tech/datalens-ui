import type {ServerField, WizardVisualizationId} from '../../../../../../../shared';
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
} from '../../../../../../../shared';
import {getConfigWithActualFieldTypes} from '../../utils/config-helpers';
import {getFieldExportingOptions} from '../../utils/export-helpers';
import {isLegendEnabled} from '../../utils/misc-helpers';
import {getAxisType} from '../helpers/axis';
import {
    getHighchartsColorAxis,
    isXAxisReversed,
    shouldUseGradientLegend,
} from '../helpers/highcharts';
import {getYPlaceholders} from '../helpers/layers';
import {getAxisFormattingByField} from '../line/helpers/axis/getAxisFormattingByField';
import type {PrepareFunctionArgs} from '../types';

import {prepareBarYData} from './prepare-bar-y-data';

// eslint-disable-next-line complexity
function getHighchartsConfig(args: PrepareFunctionArgs & {graphs: any[]}) {
    const {
        placeholders,
        colors,
        colorsConfig,
        sort,
        visualizationId,
        shared,
        graphs,
        idToDataType,
    } = args;
    // for some reason, the vertical axis for the horizontal bar is considered the X axis
    const xPlaceholder = placeholders.find((p) => p.id === PlaceholderId.Y);
    const yPlaceholder = placeholders.find((p) => p.id === PlaceholderId.X);
    const xPlaceholderSettings = xPlaceholder?.settings;
    const x: ServerField | undefined = xPlaceholder?.items[0];
    const isXDiscrete = getAxisMode(xPlaceholderSettings, x?.guid) === AxisMode.Discrete;

    const ySectionItems = yPlaceholder?.items || [];
    const colorItem = colors[0];

    const chartConfig = getConfigWithActualFieldTypes({config: shared, idToDataType});
    const xAxisMode = getXAxisMode({config: chartConfig}) ?? AxisMode.Discrete;

    const customConfig: any = {
        xAxis: {
            type: getAxisType({
                field: x,
                settings: xPlaceholder?.settings,
                axisMode: xAxisMode,
            }),
            reversed: isXAxisReversed(x, sort, visualizationId as WizardVisualizationId),
            labels: {
                formatter:
                    isDateField(x) && isXDiscrete
                        ? ChartkitHandlers.WizardXAxisFormatter
                        : undefined,
            },
        },
        axesFormatting: {
            yAxis:
                yPlaceholder?.settings?.axisFormatMode === AxisLabelFormatMode.ByField
                    ? [getAxisFormattingByField(yPlaceholder, visualizationId)]
                    : [],
            xAxis: [],
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

    if (ySectionItems.length) {
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

        const [layerYPlaceholder] = getYPlaceholders(args);

        if (layerYPlaceholder?.settings?.axisFormatMode === AxisLabelFormatMode.ByField) {
            customConfig.axesFormatting.xAxis.push(
                getAxisFormattingByField(layerYPlaceholder, visualizationId),
            );
        }
    }

    return customConfig;
}

function getConfig(args: PrepareFunctionArgs) {
    const {placeholders} = args;
    const config: any = {};

    const fields = placeholders.find((p) => p.id === PlaceholderId.X)?.items || [];
    if (fields.some(isFloatField)) {
        config.precision = MINIMUM_FRACTION_DIGITS;
    }

    return config;
}

export function prepareHighchartsBarY(args: PrepareFunctionArgs) {
    const {ChartEditor} = args;

    const preparedData = prepareBarYData(args);

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
