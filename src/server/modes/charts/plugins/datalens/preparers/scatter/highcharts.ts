import type {Highcharts} from '@gravity-ui/chartkit/highcharts';
import set from 'lodash/set';

import type {ExtendedExportingCsvOptions} from '../../../../../../../shared';
import {
    AxisLabelFormatMode,
    ChartkitHandlers,
    LegendDisplayMode,
    isDateField,
    isHtmlField,
    isMarkdownField,
} from '../../../../../../../shared';
import {getFieldExportingOptions, getFieldsExportingOptions} from '../../utils/export-helpers';
import {getGradientStops} from '../../utils/get-gradient-stops';
import {isGradientMode, isNumericalDataType} from '../../utils/misc-helpers';
import {getAxisFormattingByField} from '../line/helpers/axis/getAxisFormattingByField';
import type {ChartKitFormatSettings, PrepareFunctionArgs} from '../types';

import {prepareScatter} from './prepare-scatter';

// eslint-disable-next-line complexity
export function prepareHighchartsScatter(options: PrepareFunctionArgs) {
    const {ChartEditor, shared, placeholders, idToTitle, idToDataType} = options;
    const {
        graphs,
        categories,
        x,
        y,
        z,
        color,
        shape,
        minColorValue,
        maxColorValue,
        colorsConfig,
        size,
    } = prepareScatter(options);

    const colorFieldDataType = color ? idToDataType[color.guid] : null;

    const gradientMode =
        color &&
        colorFieldDataType &&
        colorsConfig &&
        isGradientMode({colorField: color, colorFieldDataType, colorsConfig});

    const points = graphs.map((graph) => graph.data).flat(2) as Highcharts.PointOptionsObject[];

    if (!x || !y) {
        return {
            graphs,
        };
    }

    const legendIsHidden = shared.extraSettings?.legendMode === LegendDisplayMode.Hide;

    if (ChartEditor) {
        const xPlaceholder = placeholders.find((placeholder) => placeholder.id === 'x')!;
        const yPlaceholder = placeholders.find((placeholder) => placeholder.id === 'y')!;

        const xPlaceholderSettings = xPlaceholder.settings;
        const yPlaceholderSettings = yPlaceholder.settings;

        const customConfig: Omit<Partial<Highcharts.Options>, 'exporting'> & {
            axesFormatting: {
                xAxis: (ChartKitFormatSettings | undefined)[];
                yAxis: (ChartKitFormatSettings | undefined)[];
            };
            exporting: {csv: ExtendedExportingCsvOptions};
        } = {
            axesFormatting: {xAxis: [], yAxis: []},
            exporting: {
                csv: {
                    custom: {
                        columnHeaderMap: getFieldsExportingOptions({
                            x,
                            y,
                            sizeValue: size,
                            colorValue: color,
                        }),
                        categoryHeader: getFieldExportingOptions(z || x),
                    },
                    columnHeaderFormatter: ChartkitHandlers.WizardExportColumnNamesFormatter,
                },
            },
        };

        if (xPlaceholderSettings?.title === 'auto') {
            customConfig.xAxis = {
                title: {
                    text: x.fakeTitle || idToTitle[x.guid],
                },
            };
        }

        if (yPlaceholderSettings?.title === 'auto') {
            const yDataType = idToDataType[y.guid];
            const yIsDate = isDateField({data_type: yDataType});

            customConfig.yAxis = {
                type: yIsDate ? 'datetime' : undefined,
                title: {
                    text: y.fakeTitle || idToTitle[y.guid],
                },
            };
        }

        if (xPlaceholderSettings?.axisFormatMode === AxisLabelFormatMode.ByField) {
            customConfig.axesFormatting.xAxis.push(
                getAxisFormattingByField(xPlaceholder, shared.visualization.id),
            );
        }

        if (yPlaceholderSettings?.axisFormatMode === AxisLabelFormatMode.ByField) {
            customConfig.axesFormatting.yAxis.push(
                getAxisFormattingByField(yPlaceholder, shared.visualization.id),
            );
        }

        if (gradientMode) {
            if (
                colorsConfig &&
                typeof minColorValue === 'number' &&
                typeof maxColorValue === 'number'
            ) {
                customConfig.colorAxis = {
                    min: minColorValue,
                    max: maxColorValue,
                    stops: getGradientStops({colorsConfig, points, minColorValue, maxColorValue}),
                } as Highcharts.ColorAxisOptions;
            }

            if (!legendIsHidden && isNumericalDataType(color.data_type)) {
                customConfig.legend = {
                    enabled: true,
                };
            }
        }

        const shouldUseHtmlForXAxis = isHtmlField(x) || isMarkdownField(x);
        if (shouldUseHtmlForXAxis) {
            set(customConfig, 'xAxis.labels.useHTML', true);
        }

        const shouldUseHtmlForYAxis = isHtmlField(y) || isMarkdownField(y);
        if (shouldUseHtmlForYAxis) {
            set(customConfig, 'yAxis.labels.useHTML', true);
        }

        const shouldUseHtmlForLegend =
            isMarkdownField(color) ||
            isHtmlField(color) ||
            isMarkdownField(shape) ||
            isHtmlField(shape);
        if (shouldUseHtmlForLegend) {
            set(customConfig, 'legend.useHTML', true);
        }

        ChartEditor.updateHighchartsConfig(customConfig);
    }

    return {
        graphs,
        categories,
    };
}
