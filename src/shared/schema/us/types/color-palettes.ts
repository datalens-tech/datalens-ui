import type {ColorPalette} from '../../../types/color-palettes';

export type CreateColorPaletteArgs = {
    displayName: string;
    colors: string[];
    isDefault: boolean;
    isGradient: boolean;
};

export type CreateColorPaletteResponse = ColorPalette;

export type GetColorPalettesListArgs = undefined;

export type GetColorPalettesListResponse = ColorPalette[];

export type UpdateColorPaletteArgs = {
    colorPaletteId: string;
    displayName: string;
    colors: string[];
    isDefault: boolean;
    isGradient: boolean;
};

export type UpdateColorPaletteResponse = ColorPalette;

export type DeleteColorPaletteArgs = {
    colorPaletteId: string;
};

export type DeleteColorPaletteResponse = {status: 'ok'};
