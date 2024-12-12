import {getAvailableClientPalettesMap, selectDefaultClientGradient} from 'constants/common';

import {DEFAULT_PALETTE, GradientNullModes, GradientType} from 'shared';

export const DEFAULT_BORDERS = 'show';
export const DEFAULT_THRESHOLDS_MODE = 'auto';
export const DEFAULT_GRADIENT_MODE = GradientType.TWO_POINT;
export const DEFAULT_NULL_MODE = GradientNullModes.Ignore;

export const AVAILABLE_CLIENT_PALETTES_DICT = getAvailableClientPalettesMap();
export const DEFAULT_TWO_POINT_GRADIENT = selectDefaultClientGradient(DEFAULT_GRADIENT_MODE);

export const DEFAULT_PALETTE_STATE = {
    mountedColors: {},
    palette: DEFAULT_PALETTE.id,
    selectedValue: null,
    polygonBorders: DEFAULT_BORDERS,
};

export const DEFAULT_GRADIENT_STATE = {
    reversed: false,
    gradientMode: DEFAULT_GRADIENT_MODE,
    polygonBorders: DEFAULT_BORDERS,
    thresholdsMode: DEFAULT_THRESHOLDS_MODE,
    leftThreshold: undefined,
    middleThreshold: undefined,
    rightThreshold: undefined,
    gradientPalette: DEFAULT_TWO_POINT_GRADIENT,
    nullMode: DEFAULT_NULL_MODE,
};
