import type {Highcharts} from '@gravity-ui/chartkit/highcharts';

import type {
    ExtendedSeriesLineOptions,
    RGBColor,
    RGBGradient,
    ServerField,
    TableCellsRow,
    WrappedHTML,
    WrappedMarkup,
} from '../../../../../../shared';
import {
    GradientType,
    getRangeDelta,
    getRgbColorValue,
    transformHexToRgb,
} from '../../../../../../shared';
import type {WrappedMarkdown} from '../../../../../../shared/utils/markdown';
import {getColorsSettings} from '../../helpers/color-palettes';
import type {ChartColorsConfig} from '../types';

import {getColor, getMountedColor} from './constants';

type HashTable = Record<string, number> & {colorGuid?: string};

export type ColorValue = number | null;

export type ExtendedPointOptionsObject = Omit<
    Highcharts.PointOptionsObject,
    'colorValue' | 'name'
> & {
    colorValue?: string | null;
    colorGuid?: string;
    shapeValue?: string | null;
    shapeLabel?: string | WrappedMarkdown | WrappedMarkup | WrappedHTML;
    name?: string | WrappedMarkdown | WrappedMarkup | WrappedHTML;
};

export type ExtendedSeriesScatterOptions = Omit<
    Highcharts.SeriesScatterOptions,
    'data' | 'type' | 'name'
> & {
    title?: string;
    data?: ExtendedPointOptionsObject[];
    name?: string | WrappedMarkdown | WrappedHTML;
};

interface GradientThresholdValues {
    min: number;
    mid: number;
    max: number;
    range: number;
    rangeMiddle: number;
}

function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : {};
}

type GetGradientMapArgs = {
    values: ColorValue[];
    colorsConfig: ChartColorsConfig;
    gradientThresholdValues: GradientThresholdValues;
    sameRangeDelta?: number | null;
};

export function getColorsByMeasureField(options: GetGradientMapArgs) {
    const {values, colorsConfig, gradientThresholdValues, sameRangeDelta = 0.5} = options;
    const {min, rangeMiddle, range} = gradientThresholdValues;
    const rangeMiddleRatio = rangeMiddle / range;
    const currentGradient = getCurrentGradient(colorsConfig);
    const colors: RGBColor[] = getRgbColors(currentGradient.colors, Boolean(colorsConfig.reversed));

    let deltas;

    if (range === 0) {
        deltas = values.map(() => {
            return sameRangeDelta;
        });
    } else {
        deltas = values.map((colorValue) => getRangeDelta(colorValue, min, range));
    }

    const rgbColors: Record<string, string> = {};
    deltas.forEach((delta, i) => {
        if (delta !== null) {
            const key = String(values[i]);
            rgbColors[key] = getRgbColorValue(
                delta,
                colorsConfig.gradientMode || '',
                rangeMiddleRatio,
                colors,
            );
        }
    });

    return rgbColors;
}

function mapAndColorizeTableCells(rows: TableCellsRow[], colorsConfig: ChartColorsConfig) {
    const colorValues: ColorValue[][] = rows.map((row) => {
        return row.cells.map((cell) => {
            if (typeof cell === 'object' && cell && 'color' in cell) {
                return typeof cell.color !== 'number' || Number.isNaN(cell.color)
                    ? null
                    : cell.color;
            }
            return null;
        });
    });
    const maxColorValues: ColorValue[] = colorValues.map((row) => Math.max(...row.map(Number)));

    const gradientThresholdValues = getThresholdValues(colorsConfig, maxColorValues);
    const gradientColors = getColorsByMeasureField({
        values: colorValues.flat(2),
        colorsConfig,
        gradientThresholdValues,
    });

    rows.forEach((row) => {
        row.cells.forEach((cell) => {
            if (typeof cell === 'object') {
                const colorValue =
                    typeof cell.color !== 'number' || Number.isNaN(cell.color) ? null : cell.color;
                const backgroundColor =
                    colorValue === null ? undefined : gradientColors[colorValue];

                if (backgroundColor && !cell.css) {
                    cell.css = {
                        backgroundColor,
                        color: '#FFF',
                    };
                }
            }
        });
    });
}

function colorizePivotTableCell(
    colorValue: number | null,
    colorsConfig: ChartColorsConfig,
    colorValuesForMaxMin: number[],
) {
    const gradientColors = getColorsByMeasureField({
        values: [colorValue],
        colorsConfig,
        gradientThresholdValues: getThresholdValues(colorsConfig, colorValuesForMaxMin),
    });
    const backgroundColor = gradientColors[String(colorValue)];
    if (backgroundColor) {
        return {
            backgroundColor,
            color: '#FFF',
            value: colorValue,
        };
    }

    return undefined;
}

function mapAndColorizeHashTableByGradient(hashTable: HashTable, colorsConfig: ChartColorsConfig) {
    const colorValues = Object.values(hashTable).map((colorValue) => {
        if (colorValue === null) {
            return null;
        }
        const value = Number(colorValue);
        return isNaN(value) ? null : value;
    });

    const colorValuesForMaxMin = colorValues.filter((value): value is number => value !== null);

    const gradientThresholdValues = getThresholdValues(colorsConfig, colorValuesForMaxMin);
    const {min, rangeMiddle, max} = gradientThresholdValues;
    const gradientColors = getColorsByMeasureField({
        values: colorValues,
        colorsConfig,
        gradientThresholdValues,
    });

    const acc: Record<string, {backgroundColor: string; color: string; value: ColorValue}> = {};
    const colorData = Object.entries(hashTable).reduce((acc, [key, value]) => {
        const colorValue = Number(value);
        const backgroundColor = gradientColors[colorValue];

        if (backgroundColor) {
            acc[key] = {
                backgroundColor,
                color: '#FFF',
                value: Number(colorValue),
            };
        }

        return acc;
    }, acc);

    return {colorData, min, mid: min + rangeMiddle, max};
}

function mapAndColorizeHashTableByPalette({
    hashTable,
    colors,
    mountedColors,
}: {
    hashTable: HashTable;
    colors: string[];
    mountedColors: Record<string, string>;
}) {
    const knownValues: number[] = [];
    const result: Record<string, {backgroundColor: string}> = {};

    Object.keys(hashTable).forEach((key) => {
        const value = hashTable[key];
        let colorIndex = knownValues.indexOf(value);
        let color;

        if (colorIndex === -1) {
            knownValues.push(value);
            colorIndex = knownValues.length - 1;
        }

        if (mountedColors && mountedColors[value]) {
            color = getMountedColor({mountedColors, colors, value});
        } else {
            color = getColor(colorIndex, colors);
        }

        result[key] = {backgroundColor: color};
    });

    return result;
}

function mapAndColorizePointsByGradient(
    points: Highcharts.PointOptionsObject[],
    colorsConfig: ChartColorsConfig,
) {
    const colorValues: ColorValue[] = points.map((point) => {
        if (typeof point.colorValue === 'number') {
            return point.colorValue;
        }
        return null;
    });

    const colorValuesForMaxMin = colorValues.filter((value): value is number => value !== null);
    const gradientThresholdValues = getThresholdValues(colorsConfig, colorValuesForMaxMin);

    if (gradientThresholdValues.range !== 0) {
        const gradientColors = getColorsByMeasureField({
            values: colorValues,
            colorsConfig,
            gradientThresholdValues,
        });

        points.forEach((point) => {
            const colorValue = point.colorValue;

            if (typeof colorValue === 'number' && gradientColors[colorValue]) {
                point.color = gradientColors[colorValue];
            }
        });
    }
}

function mapAndColorizeGraphsByGradient(
    graphs: ExtendedSeriesLineOptions[],
    colorsConfig: ChartColorsConfig,
) {
    const colorValues = getColorValuesAmongSeries(graphs);

    const gradientThresholdValues = getThresholdValues(colorsConfig, colorValues);
    const gradientColors = getColorsByMeasureField({
        values: colorValues,
        colorsConfig,
        gradientThresholdValues,
    });

    if (gradientThresholdValues.range !== 0) {
        graphs.forEach((graph) => {
            const points = graph.data as Highcharts.PointOptionsObject[];

            points.forEach((point) => {
                const pointColorValue = point.colorValue;

                if (typeof pointColorValue === 'number' && gradientColors[pointColorValue]) {
                    point.color = gradientColors[pointColorValue];
                }
            });
        });
    }
}

export function mapAndColorizePointsByPalette({
    points,
    colorsConfig,
    colorField,
    defaultColorPaletteId,
}: {
    points: ExtendedPointOptionsObject[];
    colorsConfig: ChartColorsConfig;
    colorField: ServerField;
    defaultColorPaletteId: string;
}): ExtendedSeriesScatterOptions[] {
    const series: ExtendedSeriesScatterOptions[] = [];
    const knownValues: (string | null | undefined)[] = [];

    const {mountedColors, colors} = getColorsSettings({
        field: colorField,
        colorsConfig: colorsConfig,
        defaultColorPaletteId,
        availablePalettes: colorsConfig.availablePalettes,
        customColorPalettes: colorsConfig.loadedColorPalettes,
    });

    points.forEach((point) => {
        const value = point.colorValue;
        let colorIndex = knownValues.indexOf(value);
        if (colorIndex === -1) {
            knownValues.push(value);
            colorIndex = knownValues.length - 1;
            let color;

            if (point.colorValue && mountedColors[point.colorValue]) {
                color = getMountedColor({mountedColors, colors, value: point.colorValue});
            } else {
                color = getColor(colorIndex, colors);
            }

            series[colorIndex] = {
                data: [point],
                color,
                name: value || '',
            };
        } else {
            const data = series[colorIndex].data;
            if (data) {
                data.push(point);
            }
        }
    });

    return series;
}

type MapAndColorizeGraphsByPalette = {
    graphs: ExtendedSeriesLineOptions[];
    colorsConfig: ChartColorsConfig;
    isShapesItemExists?: boolean;
    isColorsItemExists?: boolean;
    isSegmentsExists?: boolean;
    usedColors?: (string | undefined)[];
    colorField: ServerField | undefined;
    defaultColorPaletteId: string;
};

function mapAndColorizeGraphsByPalette({
    graphs,
    colorsConfig,
    isColorsItemExists,
    isShapesItemExists,
    isSegmentsExists,
    usedColors = [],
    colorField,
    defaultColorPaletteId,
}: MapAndColorizeGraphsByPalette) {
    const {mountedColors, colors} = getColorsSettings({
        field: colorField,
        colorsConfig,
        defaultColorPaletteId,
        availablePalettes: colorsConfig.availablePalettes,
        customColorPalettes: colorsConfig.loadedColorPalettes,
    });

    // eslint-disable-next-line complexity
    graphs.forEach((graph, i) => {
        let colorKey;
        const colorValue = graph.colorValue;
        const shapeValue = graph.shapeValue;
        const colorTitle = graph.colorKey || graph.legendTitle || graph.name;
        if ((colorValue && colorValue === colorTitle) || (colorValue && shapeValue)) {
            // ../technotes.md -> utils/colors-helpers p3
            colorKey = colorValue;
        } else if (isColorsItemExists) {
            // ../technotes.md -> utils/colors-helpers p2
            colorKey = (colorTitle || '').split(':')[0];
        } else {
            colorKey = colorTitle;
        }

        if (colorKey && mountedColors[colorKey]) {
            graph.color = getMountedColor({mountedColors, colors, value: colorKey});
        } else {
            let value = graph.colorValue;

            if (isColorsItemExists && !isShapesItemExists && graph.legendTitle) {
                value = graph.legendTitle;
            }

            let colorIndex;
            if (isShapesItemExists && !isColorsItemExists) {
                colorIndex = usedColors.indexOf(value);
            } else {
                // we use the index from forEach in the case of coloring the second y axis
                colorIndex = graph.yAxis === 0 || isSegmentsExists ? usedColors.indexOf(value) : i;
            }

            if (colorIndex === -1) {
                usedColors.push(value);
                colorIndex = usedColors.length - 1;
            }

            graph.color = getColor(colorIndex, colors);
        }
    });

    return graphs;
}

function getCurrentGradient(colorsConfig: ChartColorsConfig): RGBGradient {
    return {
        id: colorsConfig.gradientPalette!,
        colors: colorsConfig.gradientColors.map(transformHexToRgb),
    };
}

function getThresholdValues(
    colorsConfig: ChartColorsConfig,
    colorValues: ColorValue[],
): GradientThresholdValues {
    const list = colorValues.filter((d) => d !== null).map(Number);
    const max =
        colorsConfig.thresholdsMode === 'manual' &&
        typeof colorsConfig.rightThreshold !== 'undefined'
            ? Number(colorsConfig.rightThreshold)
            : Math.max(...list);

    const min =
        colorsConfig.thresholdsMode === 'manual' &&
        typeof colorsConfig.leftThreshold !== 'undefined'
            ? Number(colorsConfig.leftThreshold)
            : Math.min(...list);

    const range = max - min;

    const mid =
        colorsConfig.thresholdsMode === 'manual' &&
        colorsConfig.gradientMode === GradientType.THREE_POINT &&
        typeof colorsConfig.middleThreshold !== 'undefined'
            ? Number(colorsConfig.middleThreshold)
            : max - range / 2;

    const rangeMiddle = mid === range / 2 ? mid : mid - min;

    return {min, range, rangeMiddle, max, mid};
}

function getRgbColors(gradientColors: RGBColor[] | undefined, isReversed: boolean) {
    if (!gradientColors) {
        return [];
    }
    // Avoiding using the object by reference
    const colors: RGBColor[] = [...gradientColors];
    if (isReversed) {
        colors.reverse();
    }
    return colors;
}

function getColorValuesAmongSeries(graphs: ExtendedSeriesLineOptions[]) {
    return graphs.reduce((acc, graph) => {
        const colorValues = (graph.data as Highcharts.PointOptionsObject[])
            .filter((point) => typeof point.colorValue === 'number')
            .map((point) => point.colorValue as ColorValue);
        return [...acc, ...colorValues];
    }, [] as ColorValue[]);
}

export {
    hexToRgb,
    mapAndColorizeTableCells,
    mapAndColorizeHashTableByPalette,
    mapAndColorizeHashTableByGradient,
    mapAndColorizePointsByGradient,
    mapAndColorizeGraphsByPalette,
    mapAndColorizeGraphsByGradient,
    getCurrentGradient,
    getRgbColors,
    colorizePivotTableCell,
    getRangeDelta,
    getRgbColorValue,
    getThresholdValues,
};
