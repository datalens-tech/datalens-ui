import type {Highcharts} from '@gravity-ui/chartkit/highcharts';

import {
    ChartkitHandlers,
    ExtendedExportingCsvOptions,
    isDateField,
} from '../../../../../../../shared';
import {getGradientStops} from '../../utils/color-helpers';
import {getFieldExportingOptions, getFieldsExportingOptions} from '../../utils/export-helpers';
import {isGradientMode, isNumericalDataType} from '../../utils/misc-helpers';
import {getAxisFormattingByField} from '../line/helpers/axis/getAxisFormattingByField';
import {ChartKitFormatSettings, PrepareFunctionArgs} from '../types';

import {prepareScatter} from './prepareScatter';

// eslint-disable-next-line complexity
export function prepareHighchartsScatter(options: PrepareFunctionArgs) {
    const {ChartEditor, shared, placeholders, idToTitle, idToDataType} = options;
    const {graphs, categories, x, y, z, color, minColorValue, maxColorValue, colorsConfig, size} =
        prepareScatter(options);

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

    const legendIsHidden = shared.extraSettings && shared.extraSettings?.legendMode === 'hide';

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

        if (xPlaceholderSettings?.axisFormatMode === 'by-field') {
            customConfig.axesFormatting.xAxis.push(
                getAxisFormattingByField(xPlaceholder, shared.visualization.id),
            );
        }

        if (yPlaceholderSettings?.axisFormatMode === 'by-field') {
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
                    stops: getGradientStops(colorsConfig, points, minColorValue, maxColorValue),
                } as Highcharts.ColorAxisOptions;
            }

            if (!legendIsHidden && isNumericalDataType(color.data_type)) {
                customConfig.legend = {
                    enabled: true,
                };
            }
        }

        ChartEditor.updateHighchartsConfig(customConfig);
    }

    return {
        graphs,
        categories,
    };
}
