import type {Gradient, GradientPalettes} from 'shared/constants/gradients';
import {GradientType, selectAvailableGradients} from 'shared/constants/gradients';
import type {ColorPalette} from 'shared/types';
import type {DatalensGlobalState} from 'ui/index';

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
