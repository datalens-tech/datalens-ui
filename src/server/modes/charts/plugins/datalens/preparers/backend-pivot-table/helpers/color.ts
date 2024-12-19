import type {ServerColor} from '../../../../../../../../shared';
import {ApiV2Annotations, GradientNullModes, isMeasureName} from '../../../../../../../../shared';
import type {ChartColorsConfig} from '../../../types';
import {colorizePivotTableCell} from '../../../utils/color-helpers';
import type {AnnotationsMap, PivotDataCellValue, PivotDataRows} from '../types';

import {getAnnotation} from './misc';

export const getCurrentRowColorValues = (
    row: PivotDataRows,
    annotationsMap: AnnotationsMap,
): (number | null)[] => {
    return row.values.reduce(
        (acc, cell: PivotDataCellValue[] | null) => {
            if (!cell) {
                acc.push(null);
                return acc;
            }

            const colorAnnotation = getAnnotation(cell, annotationsMap, ApiV2Annotations.Color);

            if (!colorAnnotation) {
                acc.push(null);
                return acc;
            }

            const [colorValue] = colorAnnotation;

            const isInvalidColorValue =
                colorValue === undefined ||
                colorValue === null ||
                colorValue === '' ||
                isNaN(Number(colorValue));

            if (isInvalidColorValue) {
                acc.push(null);
                return acc;
            }

            acc.push(Number(colorValue));
            return acc;
        },
        [] as (null | number)[],
    );
};

type GetPivotColorSettingsArgs = {
    rows: PivotDataRows[];
    annotationsMap: AnnotationsMap;
};

type GetColorSettings = {
    min: number;
    max: number;
    colorValues: (number | null)[][];
};
export const getColorSettings = (args: GetPivotColorSettingsArgs): GetColorSettings | undefined => {
    const {rows, annotationsMap} = args;

    if (!rows.length) {
        return undefined;
    }

    const flatColorValues: (number | null)[] = [];

    const colorValuesByRow = rows.reduce(
        (colorValues, row) => {
            const currentRowColorValues = getCurrentRowColorValues(row, annotationsMap);

            flatColorValues.push(...currentRowColorValues);
            colorValues.push(currentRowColorValues);

            return colorValues;
        },
        [] as (null | number)[][],
    );

    const valuesWithoutNull = flatColorValues.filter((n): n is number => n !== null);

    const min = valuesWithoutNull.length ? Math.min(...valuesWithoutNull) : 0;
    const max = valuesWithoutNull.length ? Math.max(...valuesWithoutNull) : 0;

    return {
        colorValues: colorValuesByRow,
        min,
        max,
    };
};

type ColorizeByColorFieldArgs = {
    rows: any[];
    rowHeaderLength: number;
    colors: ServerColor[];
    colorsConfig: ChartColorsConfig;
    rowsData: PivotDataRows[];
    annotationsMap: AnnotationsMap;
};
export const colorizePivotTableByColorField = (args: ColorizeByColorFieldArgs) => {
    const {colors, colorsConfig, rows, rowHeaderLength, rowsData, annotationsMap} = args;

    const filteredColors = colors.filter((el) => !isMeasureName(el));
    if (!filteredColors.length) {
        return;
    }

    const colorSettings = getColorSettings({rows: rowsData, annotationsMap});

    if (!colorSettings) {
        return;
    }

    const {colorValues, min, max} = colorSettings;
    const nilValue = colorsConfig.nullMode === GradientNullModes.AsZero ? 0 : null;

    rows.forEach((row, rowIndex) => {
        for (let i = rowHeaderLength; i < row.cells.length; i++) {
            const cell = row.cells[i];
            const rawColorValue = colorValues[rowIndex][i - rowHeaderLength];
            const colorValue = rawColorValue === null ? nilValue : rawColorValue;

            const isInvalidColorValue = colorValue === null;

            if (isInvalidColorValue || (cell.css && cell.css.backgroundColor)) {
                continue;
            }

            cell.css = {
                ...cell.css,
                ...colorizePivotTableCell(colorValue, colorsConfig, [min, max]),
            };
        }
    });
};
