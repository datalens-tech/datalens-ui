import type {ColorPalette, Palette, ServerColorsConfig} from '../../../../../../../../shared';
import {
    GradientType,
    TWO_POINT_DEFAULT_ID,
    selectAvailableGradientsColors,
} from '../../../../../../../../shared';
import {selectServerPalette} from '../../../../../../../constants';
import type {ChartColorsConfig} from '../../../types';

type GetChartColorsArgs = {
    colorsConfig?: ServerColorsConfig;
    loadedColorPalettes: Record<string, ColorPalette>;
    availablePalettes: Record<string, Palette>;
};

export const getChartColorsConfig = ({
    colorsConfig = {},
    loadedColorPalettes,
    availablePalettes,
}: GetChartColorsArgs): ChartColorsConfig => {
    const fallbackColors = selectServerPalette({
        palette: colorsConfig.palette,
        availablePalettes,
    });

    const fallbackGradientColors = selectAvailableGradientsColors(
        (colorsConfig.gradientMode as GradientType | undefined) || GradientType.TWO_POINT,
        colorsConfig.gradientPalette || TWO_POINT_DEFAULT_ID,
    );

    let colors: string[] = fallbackColors;
    let gradientColors: string[] = fallbackGradientColors;

    if (colorsConfig.gradientPalette) {
        gradientColors =
            loadedColorPalettes[colorsConfig.gradientPalette]?.colors || fallbackGradientColors;
    }

    if (colorsConfig.palette) {
        colors = loadedColorPalettes[colorsConfig.palette]?.colors || fallbackColors;
    }

    return {
        ...colorsConfig,
        colors,
        gradientColors,
        loadedColorPalettes,
        availablePalettes,
    };
};
