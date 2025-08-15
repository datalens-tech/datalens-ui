import type {MarkupItem} from '../../../../../../../../../shared';
import {getDistinctValue, markupToRawString} from '../../../../../../../../../shared';
import {selectServerPalette} from '../../../../../../../../constants';
import {getColor} from '../../../../utils/constants';
import {findIndexInOrder} from '../../../../utils/misc-helpers';

import type {
    GetContinuousBackgroundColorStyle,
    GetDiscreteBackgroundColorStyle,
    GetFlatTableCellBackgroundSettingsStylesArgs,
} from './types';

const getDiscreteBackgroundColorStyle = (args: GetDiscreteBackgroundColorStyle) => {
    const {
        idToTitle,
        order,
        column,
        values,
        backgroundSettings,
        idToDataType,
        loadedColorPalettes,
        availablePalettes,
        defaultColorPaletteId,
    } = args;

    const {settings, colorFieldGuid} = backgroundSettings;

    const colorFieldTitle = idToTitle[colorFieldGuid];
    const colorFieldDataType = idToDataType[colorFieldGuid];

    const valueIndex = findIndexInOrder(order, column, colorFieldTitle);

    const rawValue = values[valueIndex] as number | string | null | MarkupItem;

    let value: number | string | null;

    if (colorFieldDataType === 'markup') {
        value = markupToRawString(rawValue as MarkupItem);
    } else {
        value = getDistinctValue(rawValue);
    }

    if (!value) {
        return;
    }

    const paletteSettings = settings.paletteState;

    const mountedColors = paletteSettings.mountedColors || {};

    const mountedColorValue = mountedColors[value];

    let colors;
    if (paletteSettings?.palette && loadedColorPalettes[paletteSettings.palette]) {
        colors = loadedColorPalettes[paletteSettings.palette].colors;
    } else {
        colors = selectServerPalette({
            palette: paletteSettings.palette,
            availablePalettes,
            defaultColorPaletteId,
        });
    }

    const colorValue = getColor(Number(mountedColorValue), colors);

    if (!colorValue) {
        return;
    }

    // eslint-disable-next-line consistent-return
    return {
        backgroundColor: colorValue,
        color: '#FFF',
    };
};

const getContinuousBackgroundColorStyle = (args: GetContinuousBackgroundColorStyle) => {
    const {currentRowIndex, backgroundColorsByMeasure, backgroundSettings} = args;

    const colors = backgroundColorsByMeasure[backgroundSettings.settingsId];
    const backgroundColor = colors[currentRowIndex];

    if (backgroundColor) {
        return {
            backgroundColor,
            color: '#FFF',
        };
    }

    return {};
};

export const getFlatTableBackgroundStyles = (
    args: GetFlatTableCellBackgroundSettingsStylesArgs,
) => {
    const {
        column,
        values,
        idToTitle,
        order,
        backgroundColorsByMeasure,
        currentRowIndex,
        idToDataType,
        loadedColorPalettes,
        availablePalettes,
        defaultColorPaletteId,
    } = args;

    const backgroundSettings = column.backgroundSettings;

    if (!backgroundSettings) {
        return;
    }

    const {settings} = backgroundSettings;

    if (settings.isContinuous) {
        // eslint-disable-next-line consistent-return
        return getContinuousBackgroundColorStyle({
            backgroundColorsByMeasure,
            currentRowIndex,
            backgroundSettings,
        });
    }

    // eslint-disable-next-line consistent-return
    return getDiscreteBackgroundColorStyle({
        column,
        values,
        backgroundSettings,
        order,
        idToTitle,
        idToDataType,
        loadedColorPalettes,
        availablePalettes,
        defaultColorPaletteId,
    });
};
