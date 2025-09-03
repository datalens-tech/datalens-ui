import {i18n} from 'i18n';
import {GradientNullModes, GradientType, WizardVisualizationId} from 'shared';
import {
    getAvailableClientPalettesMap,
    getTenantDefaultColorPaletteId,
    selectDefaultClientGradient,
} from 'ui/constants/common';

export const DEFAULT_BORDERS = 'show';
export const DEFAULT_THRESHOLDS_MODE = 'auto';
export const DEFAULT_GRADIENT_MODE = GradientType.TWO_POINT;

export const AVAILABLE_CLIENT_PALETTES_DICT = getAvailableClientPalettesMap();
export const DEFAULT_TWO_POINT_GRADIENT = selectDefaultClientGradient(DEFAULT_GRADIENT_MODE);

export const DEFAULT_PALETTE_STATE = {
    mountedColors: {},
    palette: getTenantDefaultColorPaletteId(),
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
    nullMode: undefined,
};

export const ALLOWED_FOR_NULL_MODE_VISUALIZATIONS = [
    WizardVisualizationId.FlatTable,
    WizardVisualizationId.PivotTable,
];

export const NULLS_OPTIONS = [
    {value: GradientNullModes.Ignore, content: i18n('wizard', 'label_painting-ignore')},
    {value: GradientNullModes.AsZero, content: i18n('wizard', 'label_painting-as-0')},
];
