import {
    ColorPalette,
    TableFieldBackgroundSettings,
    selectCurrentRGBGradient,
} from '../../../../../../../../shared';

export const getCurrentBackgroundGradient = (
    gradientState: TableFieldBackgroundSettings['settings']['gradientState'],
    loadedColorPalettes: Record<string, ColorPalette>,
) => {
    return selectCurrentRGBGradient(
        gradientState.gradientMode!,
        gradientState.gradientPalette!,
        loadedColorPalettes,
    );
};
