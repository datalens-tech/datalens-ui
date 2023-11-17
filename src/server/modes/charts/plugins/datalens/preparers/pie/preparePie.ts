import {
    ColorMode,
    CommonNumberFormattingOptions,
    DATASET_FIELD_TYPES,
    ExtendedSeriesLineOptions,
    MINIMUM_FRACTION_DIGITS,
    isDateField,
    isDimensionField,
    isNumberField,
} from '../../../../../../../shared';
import {ChartColorsConfig} from '../../js/helpers/colors';
import {ColorValue, getColorsByMeasureField, getThresholdValues} from '../../utils/color-helpers';
import {getColor, getMountedColor} from '../../utils/constants';
import {
    chartKitFormatNumberWrapper,
    findIndexInOrder,
    formatDate,
    isNumericalDataType,
} from '../../utils/misc-helpers';
import {PiePoint, PrepareFunctionArgs} from '../types';

export type PieConfig = {
    name: string;
    dataLabels: any;
    tooltip: any;
    data?: (PiePoint & ExtendedSeriesLineOptions)[];
    showInLegend?: boolean;
};

function mapAndColorizePieByGradient(
    points: (PiePoint & ExtendedSeriesLineOptions)[],
    colorsConfig: ChartColorsConfig,
) {
    const colorValues = points.map((point) => Number(point.colorValue) as ColorValue);

    const gradientThresholdValues = getThresholdValues(colorsConfig, colorValues);
    const gradientColors = getColorsByMeasureField({
        values: colorValues,
        colorsConfig,
        gradientThresholdValues,
    });

    points.forEach((point) => {
        const pointColorValue = point.colorValue;

        if (typeof pointColorValue === 'number' && gradientColors[pointColorValue]) {
            point.color = gradientColors[pointColorValue];
        }
    });

    return points;
}

function mapAndColorizePieByPalette({
    graphs,
    colorsConfig,
    isColorsItemExists,
    usedColors = [],
}: {
    graphs: (PiePoint & ExtendedSeriesLineOptions)[];
    colorsConfig: ChartColorsConfig;
    isColorsItemExists?: boolean;
    usedColors?: (string | undefined)[];
}) {
    // eslint-disable-next-line complexity
    graphs.forEach((graph, i) => {
        const colorValue = graph.colorValue;

        const colorKey = colorValue;

        if (
            colorsConfig &&
            colorsConfig.mountedColors &&
            (graph.colorGuid === colorsConfig.fieldGuid || colorsConfig.coloredByMeasure) &&
            colorKey &&
            colorsConfig.mountedColors[colorKey]
        ) {
            graph.color = getMountedColor(colorsConfig, colorKey);
        } else {
            let value = graph.colorValue;

            if (isColorsItemExists && graph.legendTitle) {
                value = graph.legendTitle;
            }

            // We use the index from forEach in the case of coloring the second y axis
            let colorIndex = graph.yAxis === 0 ? usedColors.indexOf(value) : i;

            if (colorIndex === -1) {
                usedColors.push(value);
                colorIndex = usedColors.length - 1;
            }

            graph.color = getColor(colorIndex, colorsConfig.colors);
        }
    });

    return graphs;
}

// eslint-disable-next-line complexity
export function preparePie({
    placeholders,
    resultData,
    sort,
    labels,
    colorsConfig,
    idToTitle,
    idToDataType,
    ChartEditor,
    disableDefaultSorting = false,
}: PrepareFunctionArgs) {
    const {data, order, totals} = resultData;
    const widgetConfig = ChartEditor.getWidgetConfig();
    const groupedData: Record<string, number> = {};
    const labelsData: Record<string, string | null> = {};

    const color = placeholders[0].items[0];

    if (!color) {
        return {graphs: []};
    }

    const colorMode = colorsConfig.colorMode;
    const colorDataType = color && color.data_type;
    const colorActualTitle = idToTitle[color.guid];
    const colorIndex = findIndexInOrder(order, color, colorActualTitle);

    const labelsLength = labels && labels.length;
    const label = labels && labels[0];
    let lDataType: DATASET_FIELD_TYPES | undefined = labels?.[0]?.data_type as DATASET_FIELD_TYPES;

    const measure = placeholders[1].items[0];

    if (!measure) {
        return {graphs: []};
    }

    const measureActualTitle = idToTitle[measure.guid];
    const measureIndex = findIndexInOrder(order, measure, measureActualTitle);
    const measureDataType = measure ? idToDataType[measure.guid] || measure.data_type : null;

    if (colorIndex === -1 || measureIndex === -1) {
        return {graphs: []};
    }

    const categories: string[] = [];

    data.forEach((values) => {
        let x = values[colorIndex];
        const y = values[measureIndex];

        if (x === null) {
            x = 'null';
        }

        if (categories.indexOf(x) === -1) {
            categories.push(x);
        }

        if (labelsLength) {
            if (label.type === 'PSEUDO') {
                if (label.title === 'Measure Values') {
                    labelsData[x] = y;
                    lDataType = undefined;
                } else {
                    labelsData[x] = x;
                    lDataType = DATASET_FIELD_TYPES.STRING;
                }
            } else {
                const labelTitle = idToTitle[label.guid];
                const i = findIndexInOrder(order, label, labelTitle);
                labelsData[x] = values[i];
            }
        }

        groupedData[x] = Number(y);
    });

    const originalTitle = measure.originalTitle;
    const guid = measure.guid;
    const title = idToTitle[guid];
    const name = title.includes(guid) && originalTitle ? originalTitle : title;
    const labelFormatting = label?.formatting as CommonNumberFormattingOptions | undefined;
    const measureFormatting = measure?.formatting as CommonNumberFormattingOptions | undefined;

    const isLabelPseudo = label?.type === 'PSEUDO';
    const labelFinalDataType = isLabelPseudo ? measureDataType : lDataType;

    const pie: PieConfig = {
        name,
        tooltip:
            measureFormatting && Object.keys(measureFormatting).length
                ? {
                      chartKitFormatting: true,
                      chartKitPrecision: measureFormatting.precision,
                      chartKitPrefix: measureFormatting.prefix,
                      chartKitPostfix: measureFormatting.postfix,
                      chartKitUnit: measureFormatting.unit,
                      chartKitFormat: measureFormatting.format,
                      chartKitLabelMode: measureFormatting.labelMode,
                      chartKitShowRankDelimiter: measureFormatting.showRankDelimiter,
                  }
                : {
                      chartKitFormatting: true,
                      chartKitPrecision: measureDataType === 'float' ? MINIMUM_FRACTION_DIGITS : 0,
                  },
        dataLabels:
            labelFormatting && Object.keys(labelFormatting).length
                ? {
                      // need to reset dataLabels.format to use dataLabels.formatter
                      format: null,
                      chartKitFormatting: true,
                      chartKitPrecision: labelFormatting.precision,
                      chartKitPrefix: labelFormatting.prefix,
                      chartKitPostfix: labelFormatting.postfix,
                      chartKitUnit: labelFormatting.unit,
                      chartKitLabelMode: labelFormatting.labelMode,
                      chartKitFormat: labelFormatting.format,
                      chartKitShowRankDelimiter: labelFormatting.showRankDelimiter,
                  }
                : {
                      chartKitFormatting: true,
                      chartKitPrecision:
                          labelFinalDataType === DATASET_FIELD_TYPES.FLOAT
                              ? MINIMUM_FRACTION_DIGITS
                              : 0,
                  },
    };

    pie.data = categories
        .map((key) => {
            let name = 'Null';
            let formattedName = '';
            let colorKey: number | string = key;

            if (key !== 'null') {
                if (isDateField(color)) {
                    name = formatDate({valueType: colorDataType, value: key, format: color.format});
                    colorKey = key;
                } else if (isNumericalDataType(colorDataType)) {
                    name = key;
                    colorKey = Number(key);

                    if (color.formatting) {
                        formattedName = chartKitFormatNumberWrapper(Number(key), {
                            lang: 'ru',
                            ...color.formatting,
                        });
                    }
                } else {
                    name = key;
                }
            }

            const point: PiePoint = {
                name,
                formattedName,
                drillDownFilterValue: key,
                y: groupedData[key],
                colorGuid: color.guid,
                colorValue: colorKey || name || color.title,
            };

            if (widgetConfig?.actionParams?.enable) {
                const actionParams: Record<string, any> = {};

                if (isDimensionField(color)) {
                    actionParams[color.guid] = key;
                }

                point.custom = {
                    actionParams,
                };
            }

            if (labelsLength) {
                if (isNumericalDataType(lDataType!) || label.title === 'Measure Values') {
                    // CLOUDSUPPORT-52785 - the logic below is a bypass of the problem that once manifested itself
                    // in external datalens, when there is the same field in both the "Indicators" section and the
                    // "Signatures" in labels turned out to be null-s, which is not logical. Since the reason for this could not be established
                    // implemented fullback - with the same field in indicators and signatures and null-value
                    // in labelsData[key], label data is taken from point.y
                    const sameFieldInLabelsAndMeasures = label.title === measure.title;

                    const labelValue =
                        sameFieldInLabelsAndMeasures && labelsData[key] === null && point.y !== null
                            ? point.y
                            : labelsData[key];

                    point.label = Number(labelValue);
                } else if (isDateField({data_type: lDataType!})) {
                    point.label = formatDate({
                        valueType: lDataType!,
                        value: labelsData[key],
                        format: label.format,
                    });
                } else {
                    point.label = labelsData[key];
                }
            }

            return point;
        })
        // We remove negative values, since pie does not know how to display them
        .filter((point) => point.y > 0) as (PiePoint & ExtendedSeriesLineOptions)[];

    if (!disableDefaultSorting && (!sort || !sort.length)) {
        pie.data!.sort((a, b) => {
            return a.y > b.y ? -1 : a.y < b.y ? 1 : 0;
        });
    }

    const isColoringByGradient =
        (color.type === 'MEASURE' && isNumberField(color)) || colorMode === ColorMode.GRADIENT;

    if (isColoringByGradient) {
        pie.data = mapAndColorizePieByGradient(pie.data, colorsConfig);
    } else {
        pie.data = mapAndColorizePieByPalette({
            graphs: pie.data,
            colorsConfig,
            isColorsItemExists: Boolean(color),
        });
    }

    const graphs = [pie];
    const totalsValue = totals.find((value) => value);

    return {graphs, categories, totals: totalsValue, label, measure};
}

export default preparePie;
