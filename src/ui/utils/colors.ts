import type {ColorPalette} from 'shared';
import {getAvailableClientPalettesMap} from 'ui/constants';

export function getPaletteColors(paletteName: string, clientPalettes?: ColorPalette[]) {
    const clientPalette = clientPalettes?.find((item) => item.colorPaletteId === paletteName);
    if (clientPalette) {
        return clientPalette.colors;
    }

    const availablePalettesMap = getAvailableClientPalettesMap();

    const currentPalette = availablePalettesMap[paletteName];

    return currentPalette?.scheme || [];
}

export function isValidHexColor(hexColor: string, allowTransparency = false) {
    return (allowTransparency ? /^#[\da-f]{3,8}$/i : /^#[\da-f]{3,6}$/i).test(hexColor);
}
