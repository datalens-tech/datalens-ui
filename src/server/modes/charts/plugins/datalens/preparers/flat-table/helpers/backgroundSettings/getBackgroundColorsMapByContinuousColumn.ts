import {
    RGBColor,
    ServerField,
    TableFieldBackgroundSettings,
} from '../../../../../../../../../shared';
import {ChartColorsConfig} from '../../../../js/helpers/colors';
import {
    getCurrentGradient,
    getRangeDelta,
    getRgbColorValue,
    getRgbColors,
    getThresholdValues,
} from '../../../../utils/color-helpers';
import {
    findIndexInOrder,
    isTableFieldBackgroundSettingsEnabled,
} from '../../../../utils/misc-helpers';
import {getCurrentBackgroundGradient} from '../../../helpers/backgroundSettings/misc';
import {PrepareFunctionDataRow} from '../../../types';

import {GetBackgroundColorsMapByContinuousColumn} from './types';

const MAX_COLOR_DELTA_VALUE = 1;

export const colorizeFlatTableColumn = ({
    data,
    colorsConfig,
    index,
}: {
    data: PrepareFunctionDataRow[];
    index: number;
    colorsConfig: ChartColorsConfig;
}) => {
    const colorValues = data.reduce((acc, row) => {
        const rowValue = row[index];
        const parsedRowValue = rowValue === null ? rowValue : parseFloat(rowValue);

        return [...acc, parsedRowValue];
    }, [] as (number | null)[]);

    const {rangeMiddle, range, min} = getThresholdValues(colorsConfig, colorValues);
    const rangeMiddleRatio = range === 0 ? MAX_COLOR_DELTA_VALUE : rangeMiddle / range;

    const currentGradient = getCurrentGradient(colorsConfig);

    const colors: RGBColor[] = getRgbColors(currentGradient.colors, Boolean(colorsConfig.reversed));

    let deltas: (number | null)[];

    if (range === 0) {
        // If all values are the same, then we paint in the maximum color.
        deltas = colorValues.map(() => MAX_COLOR_DELTA_VALUE);
    } else {
        deltas = colorValues.map((colorValue) => {
            return getRangeDelta(colorValue, min, range);
        });
    }

    return deltas.map((delta) => {
        if (delta === null) {
            return null;
        }
        return getRgbColorValue(delta, colorsConfig.gradientMode || '', rangeMiddleRatio, colors);
    });
};

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

    return measuresWhichUsedForColorizing.reduce((acc, column) => {
        const backgroundColors = column.backgroundSettings;
        const guid = backgroundColors.colorFieldGuid;
        const colorsConfig = backgroundColors.settings.gradientState;

        const chartColorsConfig: ChartColorsConfig = {
            ...colorsConfig,
            colors: [],
            loadedColorPalettes: {},
            gradientColors: getCurrentBackgroundGradient(colorsConfig, loadedColorPalettes).colors,
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
    }, {} as Record<string, any>);
};
