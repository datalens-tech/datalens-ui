import {type ColorPalette} from 'shared';
import {getAvailableClientPalettesMap, getTenantDefaultColorPaletteId} from 'ui/constants';

export function getPaletteColors(paletteName: string, clientPalettes?: ColorPalette[]) {
    const clientPalette = clientPalettes?.find((item) => item.colorPaletteId === paletteName);
    if (clientPalette) {
        return clientPalette.colors;
    }

    const availablePalettesMap = getAvailableClientPalettesMap();

    const currentPalette =
        availablePalettesMap[paletteName] || availablePalettesMap[getTenantDefaultColorPaletteId()];

    return currentPalette?.scheme || [];
}

export function isValidHexColor(hexColor: string) {
    return /^#[\da-f]{3,6}$/i.test(hexColor);
}
