import type {ValueOf} from 'shared';

export const CustomPaletteBgColors = {
    LIKE_CHART: 'like-chart-bg',
    NONE: 'transparent',
} as const;

export type CustomPaletteBgColor = ValueOf<typeof CustomPaletteBgColors>;

export function isCustomPaletteColor(color: string): color is CustomPaletteBgColor {
    return Object.keys(CustomPaletteBgColors).includes(color as CustomPaletteBgColor);
}

export const WIDGET_BG_HEAVY_COLORS_PRESET = [
    'var(--g-color-base-info-heavy)',
    'var(--g-color-base-positive-heavy)',
    'var(--g-color-base-warning-heavy)',
    'var(--g-color-base-danger-heavy)',
    'var(--g-color-base-utility-heavy)',
    'var(--g-color-base-misc-heavy)',
    'var(--g-color-base-neutral-heavy)',
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
    ...WIDGET_BG_HEAVY_COLORS_PRESET,

    CustomPaletteBgColors.NONE,
    CustomPaletteBgColors.LIKE_CHART,
];
