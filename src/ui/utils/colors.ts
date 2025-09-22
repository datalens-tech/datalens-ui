import {type ColorPalette} from 'shared';
import {
    getAvailableClientPalettesMap,
    getDefaultColorPaletteId,
    getTenantDefaultColorPaletteId,
} from 'ui/constants';

export const getDefaultColorPalette = ({colorPalettes}: {colorPalettes?: ColorPalette[]}) => {
    const tenantDefaultColorPaletteId = getTenantDefaultColorPaletteId();
    const customPalette = colorPalettes?.find(
        (p) => p.colorPaletteId === tenantDefaultColorPaletteId,
    );

    if (customPalette) {
        return customPalette;
    }

    const systemPalettes = getAvailableClientPalettesMap();
    const defaultColorPaletteId = getDefaultColorPaletteId();
    const systemPalette =
        systemPalettes[tenantDefaultColorPaletteId] ?? systemPalettes[defaultColorPaletteId];

    return systemPalette;
};

export function getPaletteColors(paletteName: string | undefined, clientPalettes?: ColorPalette[]) {
    if (paletteName) {
        const clientPalette = clientPalettes?.find((item) => item.colorPaletteId === paletteName);
        if (clientPalette) {
            return clientPalette.colors;
        }

        const availablePalettesMap = getAvailableClientPalettesMap();
        if (availablePalettesMap[paletteName]) {
            return availablePalettesMap[paletteName].scheme;
        }
    }

    const defaultColorPalette = getDefaultColorPalette({colorPalettes: clientPalettes});

    return 'colors' in defaultColorPalette
        ? defaultColorPalette.colors
        : defaultColorPalette.scheme;
}

export function isValidHexColor(hexColor: string) {
    return /^#[\da-f]{3,6}$/i.test(hexColor);
}
