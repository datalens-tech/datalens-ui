import {
    ColorPalette,
    GradientType,
    ServerColorsConfig,
    TWO_POINT_DEFAULT_ID,
    selectAvailableGradientsColors,
} from '../../../../../../../../shared';
import {selectServerPalette} from '../../../../../../../constants';

export interface ChartColorsConfig extends ServerColorsConfig {
    colors: string[];
    gradientColors: string[];
    loadedColorPalettes: Record<string, ColorPalette>;
}

type GetChartColorsArgs = {
    colorsConfig?: ServerColorsConfig;
    loadedColorPalettes: Record<string, ColorPalette>;
};

export const getChartColorsConfig = ({
    colorsConfig = {},
    loadedColorPalettes,
}: GetChartColorsArgs): ChartColorsConfig => {
    const fallbackColors = selectServerPalette(colorsConfig.palette);

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

    const chartColors: ChartColorsConfig = {
        ...colorsConfig,
        colors,
        gradientColors,
        loadedColorPalettes,
    };

    return chartColors;
};
