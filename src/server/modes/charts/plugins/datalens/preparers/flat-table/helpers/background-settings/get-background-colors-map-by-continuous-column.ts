import isNil from 'lodash/isNil';
import isNumber from 'lodash/isNumber';

import {
    RGBColor,
    ServerField,
    TableFieldBackgroundSettings,
} from '../../../../../../../../../shared';
import {ChartColorsConfig} from '../../../../js/helpers/colors';
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
import {PrepareFunctionDataRow} from '../../../types';

import {GetBackgroundColorsMapByContinuousColumn} from './types';

const MAX_COLOR_DELTA_VALUE = 1;

export function colorizeFlatTableColumn({
    data,
    colorsConfig,
    index,
}: {
    data: PrepareFunctionDataRow[];
    index: number;
    colorsConfig: ChartColorsConfig;
}) {
    const colorValues = data.reduce(
        (acc, row) => {
            const rowValue = row[index];
            const parsedRowValue = isNil(rowValue) ? null : parseFloat(rowValue);

            return [...acc, parsedRowValue];
        },
        [] as (number | null)[],
    );

    const {min, mid, max} = getThresholdValues(colorsConfig, colorValues.filter(isNumber));
    const currentGradient = getCurrentGradient(colorsConfig);
    const colors: RGBColor[] = getRgbColors(currentGradient.colors, Boolean(colorsConfig.reversed));
    const getRgbColor = interpolateRgbBasis(colors);

    let deltas: (number | null)[];

    if (min === max) {
        // If all values are the same, then we paint in the maximum color.
        deltas = colorValues.map(() => MAX_COLOR_DELTA_VALUE);
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
    const {columns, idToTitle, order, data, loadedColorPalettes} = args;

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
            const colorsConfig = backgroundColors.settings.gradientState;

            const chartColorsConfig: ChartColorsConfig = {
                ...colorsConfig,
                colors: [],
                loadedColorPalettes: {},
                gradientColors:
                    getCurrentBackgroundGradient(colorsConfig, loadedColorPalettes)?.colors || [],
            };

            const title = idToTitle[guid];
            const index = findIndexInOrder(order, column, title);

            const rgbColorValues = colorizeFlatTableColumn({
                colorsConfig: chartColorsConfig,
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
