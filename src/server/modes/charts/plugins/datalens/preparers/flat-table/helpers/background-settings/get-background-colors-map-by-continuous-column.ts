import isNil from 'lodash/isNil';
import isNumber from 'lodash/isNumber';

import {
    GradientNullModes,
    type RGBColor,
    type ServerField,
    type TableFieldBackgroundSettings,
} from '../../../../../../../../../shared';
import type {ChartColorsConfig} from '../../../../types';
import {
    getCurrentGradient,
    getRangeDelta,
    getRgbColors,
    getThresholdValues,
} from '../../../../utils/color-helpers';
import {
    findIndexInOrder,
    isTableFieldBackgroundSettingsEnabled,
} from '../../../../utils/misc-helpers';
import {getCurrentBackgroundGradient} from '../../../helpers/backgroundSettings/misc';
import {interpolateRgbBasis} from '../../../helpers/colors';
import type {PrepareFunctionDataRow} from '../../../types';

import type {GetBackgroundColorsMapByContinuousColumn} from './types';

const MAX_COLOR_DELTA_VALUE = 1;

function getColorFn(colors: RGBColor[]) {
    if (colors.length > 2) {
        const firstColors = interpolateRgbBasis(colors.slice(0, 2));
        const lastColors = interpolateRgbBasis(colors.slice(1));

        return (colorValue: number) =>
            colorValue >= 0.5 ? lastColors((colorValue - 0.5) * 2) : firstColors(colorValue * 2);
    }

    return interpolateRgbBasis(colors);
}

export function colorizeFlatTableColumn({
    data,
    colorsConfig,
    index,
}: {
    data: PrepareFunctionDataRow[];
    index: number;
    colorsConfig: ChartColorsConfig;
}) {
    const nilValue = colorsConfig.nullMode === GradientNullModes.AsZero ? 0 : null;
    const colorValues = data.reduce<(number | null)[]>((acc, row) => {
        const rowValue = row[index];
        const parsedRowValue = isNil(rowValue) ? nilValue : parseFloat(rowValue);
        acc.push(parsedRowValue);
        return acc;
    }, []);

    const {min, mid, max} = getThresholdValues(colorsConfig, colorValues.filter(isNumber));
    const currentGradient = getCurrentGradient(colorsConfig);
    const colors: RGBColor[] = getRgbColors(currentGradient.colors, Boolean(colorsConfig.reversed));
    const getRgbColor = getColorFn(colors);

    let deltas: (number | null)[];

    if (min === max) {
        // If all values are the same, then we paint in the maximum color.
        deltas = colorValues.map((colorValue) => {
            if (colorValue === null) {
                return null;
            }

            return MAX_COLOR_DELTA_VALUE;
        });
    } else {
        deltas = colorValues.map((colorValue) => {
            if (colorValue === null) {
                return null;
            }

            if (colorValue <= min) {
                return 0;
            }

            if (colorValue >= max) {
                return 1;
            }

            return colorValue >= mid
                ? getRangeDelta(colorValue, 2 * mid - max, 2 * (max - mid))
                : getRangeDelta(colorValue, min, 2 * (mid - min));
        });
    }

    return deltas.map((delta) => {
        if (delta === null) {
            return null;
        }

        const {red, green, blue} = getRgbColor(delta);
        return `rgb(${red}, ${green}, ${blue})`;
    });
}

export const getBackgroundColorsMapByContinuousColumn = (
    args: GetBackgroundColorsMapByContinuousColumn,
) => {
    const {columns, idToTitle, order, data, chartColorsConfig} = args;

    const columnsWithBackgroundSettings = columns.filter(
        (column): column is ServerField & {backgroundSettings: TableFieldBackgroundSettings} =>
            isTableFieldBackgroundSettingsEnabled(column),
    );

    const measuresWhichUsedForColorizing = columnsWithBackgroundSettings.filter(
        (column) => column.backgroundSettings.settings.isContinuous,
    );

    return measuresWhichUsedForColorizing.reduce(
        (acc, column) => {
            const backgroundColors = column.backgroundSettings;
            const guid = backgroundColors.colorFieldGuid;
            const gradientState = backgroundColors.settings.gradientState;

            const colorsConfig: ChartColorsConfig = {
                ...gradientState,
                colors: [],
                loadedColorPalettes: {},
                availablePalettes: chartColorsConfig.availablePalettes,
                gradientColors:
                    getCurrentBackgroundGradient(
                        gradientState,
                        chartColorsConfig.loadedColorPalettes,
                    )?.colors || [],
            };

            const title = idToTitle[guid];
            const index = findIndexInOrder(order, column, title);

            const rgbColorValues = colorizeFlatTableColumn({
                colorsConfig: colorsConfig,
                index,
                data,
            });
            return {
                ...acc,
                [backgroundColors.settingsId]: rgbColorValues,
            };
        },
        {} as Record<string, any>,
    );
};
