import type {DatalensGlobalState} from '../../../ui';
import type {ColorPalette} from '../../types/color-palettes';
import type {ValueOf} from '../../types/utility-types';

import {
    THREE_POINT_DEFAULT_GRADIENT,
    THREE_POINT_DEFAULT_ID,
    TWO_POINT_DEFAULT_GRADIENT,
    TWO_POINT_DEFAULT_ID,
} from './default';
import {THREE_POINT_GRADIENTS, THREE_POINT_GRADIENT_PALETTES} from './three-point-gradients';
import {TWO_POINT_GRADIENTS, TWO_POINT_GRADIENT_PALETTES} from './two-point-gradients';

export {TWO_POINT_DEFAULT_ID, THREE_POINT_DEFAULT_ID};

export enum GradientType {
    TWO_POINT = '2-point',
    THREE_POINT = '3-point',
}

export enum ColorMode {
    PALETTE = 'palette',
    GRADIENT = 'gradient',
}

export interface Gradient {
    id: string;
    title?: string;
    colors: string[];
}

export const GradientNullModes = {
    Ignore: 'ignore',
    AsZero: 'as-0',
};

export type GradientNullMode = ValueOf<typeof GradientNullModes>;

export interface RGBColor {
    red: number;
    green: number;
    blue: number;
}

export interface RGBGradient extends Omit<Gradient, 'colors'> {
    colors: RGBColor[];
}

type Gradients<T> = {
    [key in GradientType]: T;
};

export type GradientPalettes = Record<Gradient['id'], Gradient>;
export type RGBGradientPalettes = Record<RGBGradient['id'], RGBGradient>;

const GRADIENTS: Gradients<GradientPalettes> = {
    [GradientType.TWO_POINT]: TWO_POINT_GRADIENTS,
    [GradientType.THREE_POINT]: THREE_POINT_GRADIENTS,
};

export const selectAvailableGradients = (gradientType: GradientType) => GRADIENTS[gradientType];

export const selectAvailableClientGradients = (
    state: DatalensGlobalState,
    gradientType: GradientType,
): GradientPalettes => {
    const colorsLength = gradientType === GradientType.TWO_POINT ? 2 : 3;

    const gradientPalletes = state.colorPaletteEditor.colorPalettes
        .filter((colorPalette: ColorPalette) => {
            return colorPalette.isGradient && colorPalette.colors.length === colorsLength;
        })
        .reduce(
            (acc: GradientPalettes, colorPalette: ColorPalette) => ({
                ...acc,
                [colorPalette.colorPaletteId]: {
                    id: colorPalette.colorPaletteId,
                    title: colorPalette.displayName,
                    colors: colorPalette.colors,
                } as Gradient,
            }),
            {},
        );

    return {
        ...selectAvailableGradients(gradientType),
        ...gradientPalletes,
    };
};

export const selectAvailableGradientsColors = (
    gradientType: GradientType,
    gradientId: string,
): string[] => {
    const colors = GRADIENTS[gradientType]?.[gradientId]?.colors;

    if (colors) {
        return colors;
    }

    if (gradientType === GradientType.TWO_POINT) {
        return TWO_POINT_DEFAULT_GRADIENT[TWO_POINT_DEFAULT_ID].colors;
    }

    return THREE_POINT_DEFAULT_GRADIENT[THREE_POINT_DEFAULT_ID].colors;
};

export const selectCurrentRGBGradient = (
    gradientType: GradientType,
    gradientId: string,
    loadedColorPalettes: Record<string, ColorPalette>,
) => {
    if (loadedColorPalettes[gradientId]) {
        return loadedColorPalettes[gradientId];
    } else {
        return GRADIENTS[gradientType][gradientId];
    }
};

export const selectGradient = (gradientType: GradientType, gradientId: string) =>
    gradientType === GradientType.TWO_POINT
        ? TWO_POINT_DEFAULT_GRADIENT[gradientId].id
        : THREE_POINT_DEFAULT_GRADIENT[gradientId].id;

export function transformHexToRgb(color: string): RGBColor {
    const red = parseInt(color.slice(1, 3), 16);
    const green = parseInt(color.slice(3, 5), 16);
    const blue = parseInt(color.slice(5, 7), 16);

    return {red, green, blue};
}

export const GRADIENT_PALETTES = {
    ...TWO_POINT_GRADIENT_PALETTES,
    ...THREE_POINT_GRADIENT_PALETTES,
};

export const isSystemGradientPaletteId = (value: string) => {
    return Boolean(TWO_POINT_GRADIENTS[value] || THREE_POINT_GRADIENTS[value]);
};
