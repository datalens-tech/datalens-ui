import type {ValueOf} from '../types';

export const CustomPaletteBgColors = {
    LIKE_CHART: 'like-chart-bg',
    NONE: 'transparent',
} as const;

export const BASE_GREY_BACKGROUND_COLOR = 'var(--g-color-base-generic)';

export type CustomPaletteBgColor = ValueOf<typeof CustomPaletteBgColors>;

export function isCustomPaletteBgColor(color: string): color is CustomPaletteBgColor {
    return Object.values(CustomPaletteBgColors).includes(color as CustomPaletteBgColor);
}

export const WIDGET_BG_HEAVY_COLORS_PRESET = [
    'var(--g-color-base-info-heavy)',
    'var(--g-color-base-positive-heavy)',
    'var(--g-color-base-warning-heavy)',
    'var(--g-color-base-danger-heavy)',
    'var(--g-color-base-utility-heavy)',
    'var(--g-color-base-misc-heavy)',
    'var(--g-color-base-neutral-heavy)',

    'var(--g-color-base-info-heavy-hover)',
    'var(--g-color-base-positive-heavy-hover)',
    'var(--g-color-base-warning-heavy-hover)',
    'var(--g-color-base-danger-heavy-hover)',
    'var(--g-color-base-utility-heavy-hover)',
    'var(--g-color-base-misc-heavy-hover)',
    'var(--g-color-base-neutral-heavy-hover)',
];

export const DUPLICATED_WIDGET_BG_COLORS_PRESET = [
    'var(--g-color-base-info-medium)',
    'var(--g-color-base-positive-medium)',
    'var(--g-color-base-warning-medium)',
    'var(--g-color-base-danger-medium)',
    'var(--g-color-base-utility-medium)',
    'var(--g-color-base-misc-medium)',
    'var(--g-color-base-neutral-medium)',
];

export const WIDGET_BG_COLORS_PRESET = [
    'var(--g-color-base-info-light)',
    'var(--g-color-base-positive-light)',
    'var(--g-color-base-warning-light)',
    'var(--g-color-base-danger-light)',
    'var(--g-color-base-utility-light)',
    'var(--g-color-base-misc-light)',
    'var(--g-color-base-neutral-light)',

    'var(--g-color-base-info-light-hover)',
    'var(--g-color-base-positive-light-hover)',
    'var(--g-color-base-warning-light-hover)',
    'var(--g-color-base-danger-light-hover)',
    'var(--g-color-base-utility-light-hover)',
    'var(--g-color-base-misc-light-hover)',
    'var(--g-color-base-neutral-light-hover)',

    'var(--g-color-base-info-medium-hover)',
    'var(--g-color-base-positive-medium-hover)',
    'var(--g-color-base-warning-medium-hover)',
    'var(--g-color-base-danger-medium-hover)',
    'var(--g-color-base-utility-medium-hover)',
    'var(--g-color-base-misc-medium-hover)',
    'var(--g-color-base-neutral-medium-hover)',
];

export const TITLE_WIDGET_TEXT_COLORS_PRESET = [
    'var(--g-color-text-info)',
    'var(--g-color-text-positive)',
    'var(--g-color-text-warning)',
    'var(--g-color-text-danger)',
    'var(--g-color-text-utility)',
    'var(--g-color-text-misc)',

    'var(--g-color-text-info-heavy)',
    'var(--g-color-text-positive-heavy)',
    'var(--g-color-text-warning-heavy)',
    'var(--g-color-text-danger-heavy)',
    'var(--g-color-text-utility-heavy)',
    'var(--g-color-text-misc-heavy)',
];

export const CustomPaletteTextColors = {
    PRIMARY: 'var(--g-color-text-primary)',
    COMPLEMENTARY: 'var(--g-color-text-complementary)',
    SECONDARY: 'var(--g-color-text-secondary)',
    HINT: 'var(--g-color-text-hint)',
    INVERTED_PRIMARY: 'var(--g-color-text-inverted-primary)',
} as const;

export type CustomPaletteTextColor = ValueOf<typeof CustomPaletteTextColors>;

export const CONTROLS_PLACEMENT_MODE = {
    AUTO: 'auto',
    PERCENT: '%',
    PIXELS: 'px',
};
