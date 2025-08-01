import {type ColorPalette, DEFAULT_PALETTE} from 'shared';
import {getAvailableClientPalettesMap} from 'ui/constants';

export function getPaletteColors(paletteName: string, clientPalettes?: ColorPalette[]) {
    const clientPalette = clientPalettes?.find((item) => item.colorPaletteId === paletteName);
    if (clientPalette) {
        return clientPalette.colors;
    }

    const availablePalettesMap = getAvailableClientPalettesMap();

    const currentPalette =
        availablePalettesMap[paletteName] || availablePalettesMap[DEFAULT_PALETTE.id];

    return currentPalette?.scheme || [];
}

export function isValidHexColor(hexColor: string) {
    return /^#[\da-f]{3,6}$/i.test(hexColor);
}
