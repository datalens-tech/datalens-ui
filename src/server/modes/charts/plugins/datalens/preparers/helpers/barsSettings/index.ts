import type {
    BarGradientColorSettings,
    BarTwoColorSettings,
    BarViewOptions,
    ColorPalette,
    ServerField,
    TableBarsSettings,
} from '../../../../../../../../shared';
import {
    getFormatOptions,
    getRangeDelta,
    getRgbColorValue,
    selectCurrentRGBGradient,
    transformHexToRgb,
} from '../../../../../../../../shared';
import {getRgbColors} from '../../../utils/color-helpers';
import {chartKitFormatNumberWrapper} from '../../../utils/misc-helpers';
import type {PrepareFunctionDataRow} from '../../types';

import type {BarValueOptions} from './types';

const getMinAndMaxValues = (columnValues: PrepareFunctionDataRow) => {
    const parsedValues: number[] = columnValues.filter((v) => v !== null).map(Number);
    const min = Math.min(...parsedValues);
    const max = Math.max(...parsedValues);
    return {
        min,
        max,
    };
};
const getCurrentBarGradient = (
    colors: BarGradientColorSettings['settings'],
    loadedColorPalettes: Record<string, ColorPalette>,
) => {
    return selectCurrentRGBGradient(colors.gradientType, colors.palette, loadedColorPalettes);
};
const getBarThresholdValues = (
    thresholds: BarGradientColorSettings['settings']['thresholds'],
    columnValues: PrepareFunctionDataRow,
) => {
    const preparedMinAndMax = getMinAndMaxValues(columnValues);
    const max =
        thresholds.mode === 'manual' && typeof thresholds.max !== 'undefined'
            ? Number(thresholds.max)
            : preparedMinAndMax.max;

    const min =
        thresholds.mode === 'manual' && typeof thresholds.min !== 'undefined'
            ? Number(thresholds.min)
            : preparedMinAndMax.min;

    const range = max - min;

    const mid =
        thresholds.mode === 'manual' && typeof thresholds.mid !== 'undefined'
            ? Number(thresholds.mid)
            : range / 2;

    const rangeMiddle = mid === range / 2 ? mid : mid - min;

    return {min, max, mid, range, rangeMiddle};
};
const getTwoColorBarColor = (rowValue: string, colors: BarTwoColorSettings['settings']) => {
    const parsedValue = parseFloat(rowValue);

    return parsedValue >= 0 ? colors.positiveColor : colors.negativeColor;
};
const getGradientBarColor = (args: {
    columnValues: PrepareFunctionDataRow;
    colors: BarGradientColorSettings['settings'];
    currentColumnValue: string | null;
    loadedColorPalettes: Record<string, ColorPalette>;
}) => {
    const {colors, columnValues, currentColumnValue, loadedColorPalettes} = args;
    const currentGradient = getCurrentBarGradient(colors, loadedColorPalettes);
    const gradientColors = getRgbColors(
        currentGradient.colors.map(transformHexToRgb),
        Boolean(colors.reversed),
    );
    const {rangeMiddle, range, min} = getBarThresholdValues(colors.thresholds, columnValues);
    const rangeMiddleRatio = rangeMiddle / range;

    let delta;
    if (range === 0) {
        delta = 0.5;
    } else {
        const colorValue = currentColumnValue ? Number(currentColumnValue) : null;
        delta = getRangeDelta(colorValue, min, range);
    }

    if (typeof delta === 'number') {
        return getRgbColorValue(delta, colors.gradientType, rangeMiddleRatio, gradientColors);
    }

    return '';
};
export const getBarSettingsViewOptions = (args: {
    barsSettings: TableBarsSettings;
    columnValues: PrepareFunctionDataRow;
}): BarViewOptions => {
    const {barsSettings, columnValues} = args;
    const barViewOptions: BarViewOptions = {
        view: 'bar',
        showLabel: barsSettings.showLabels,
    };

    let min: number | undefined, max: number | undefined;

    if (barsSettings.scale.mode === 'auto') {
        const minAndMaxValues = getMinAndMaxValues(columnValues);
        min = minAndMaxValues.min;
        max = minAndMaxValues.max;
    } else {
        min =
            typeof barsSettings.scale.settings.min === 'undefined'
                ? barsSettings.scale.settings.min
                : Number(barsSettings.scale.settings.min);
        max =
            typeof barsSettings.scale.settings.max === 'undefined'
                ? barsSettings.scale.settings.max
                : Number(barsSettings.scale.settings.max);
    }

    const isMinCorrect = typeof min === 'number' && !isNaN(min) && min <= 0;
    const isMaxCorrect = typeof max === 'number' && !isNaN(max) && max >= 0;

    const isMinEqualMax = isMinCorrect && isMaxCorrect && min === max;

    if (isMinEqualMax) {
        barViewOptions.max = min;
    } else {
        barViewOptions.min = isMinCorrect ? min : undefined;
        barViewOptions.max = isMaxCorrect ? max : undefined;
    }

    barViewOptions.align = barsSettings.align === 'default' ? undefined : barsSettings.align;

    return barViewOptions;
};
export const getBarSettingsValue = (args: {
    field: ServerField;
    rowValue: string;
    columnValues: PrepareFunctionDataRow;
    isTotalCell: boolean;
    loadedColorPalettes: Record<string, ColorPalette>;
}): BarValueOptions => {
    const {field, rowValue, columnValues, isTotalCell, loadedColorPalettes} = args;

    const barSettings = field.barsSettings!;

    const formatOptions = getFormatOptions(field);

    let barColor: string;

    switch (barSettings.colorSettings.colorType) {
        case 'one-color':
            barColor = barSettings.colorSettings.settings.color;
            break;
        case 'two-color':
            barColor = getTwoColorBarColor(rowValue, barSettings.colorSettings.settings);
            break;
        case 'gradient':
            barColor = getGradientBarColor({
                columnValues,
                colors: barSettings.colorSettings.settings,
                currentColumnValue: rowValue,
                loadedColorPalettes,
            });
            break;
        default:
            barColor = '';
    }

    const parsedValue = parseFloat(rowValue);

    return {
        value: isNaN(parsedValue) ? 0 : parsedValue,
        barColor,
        formattedValue: isNaN(parsedValue)
            ? rowValue
            : chartKitFormatNumberWrapper(parsedValue, formatOptions),
        showBar: !isTotalCell || (isTotalCell && barSettings.showBarsInTotals),
    };
};
