export const AUTO_PALETTE_ID = 'auto';

export const GRADIENT_PALETTE_ID = {
    EMERALD_20: 'emerald20-palette',
    GOLDEN_20: 'golden20-palette',
    NEUTRAL_20: 'neutral20-palette',
    OCEANIC_20: 'oceanic20-palette',
    TRAFFIC_LIGHT_9: 'traffic-light9-palette',
} as const;

export const COMMON_PALETTE_ID = {
    CLASSIC_20: 'classic20',
    DEFAULT_20: 'default20',
    DATALENS_NEO_20: 'datalens-neo-20-palette',
    ...GRADIENT_PALETTE_ID,
} as const;

export const TABLEAU_PALETTE_ID = {
    BLUE_RED_6: 'Blue-Red 6',
    BLUE_RED_12: 'Blue-Red 12',
    COLOR_BLIND_10: 'Color-Blind 10',
    GRAY_5: 'Gray 5',
    GREEN_ORANGE_6: 'Green-Orange 6',
    GREEN_ORANGE_12: 'Green-Orange 12',
    PURPURE_GRAY_6: 'Purpure-Gray 6',
    PURPURE_GRAY_12: 'Purpure-Gray 12',
    TABLEAU_10_LIGHT: 'Tableau 10 Light',
    TABLEAU_10_MEDIUM: 'Tableau 10 Medium',
    TABLEAU_10: 'Tableau 10',
    TABLEAU_20: 'Tableau 20',
    TRAFFIC_LIGHT: 'Traffic Light',
} as const;

export const PALETTE_ID = {
    AUTO_PALETTE_ID,
    ...COMMON_PALETTE_ID,
    ...TABLEAU_PALETTE_ID,
} as const;

export type CommonPaletteId = (typeof COMMON_PALETTE_ID)[keyof typeof COMMON_PALETTE_ID];
export type TableauPaletteId = (typeof TABLEAU_PALETTE_ID)[keyof typeof TABLEAU_PALETTE_ID];
export type InternalPaletteId = CommonPaletteId;
export type GradientPaletteId = (typeof COMMON_PALETTE_ID)[keyof typeof GRADIENT_PALETTE_ID];
export type BasePaletteId = CommonPaletteId | TableauPaletteId;

export type Palette = {
    id: string;
    scheme: string[];
    gradient?: boolean;
    datalens?: boolean;
};

export type GradientPalette = Palette & {gradient: true};
