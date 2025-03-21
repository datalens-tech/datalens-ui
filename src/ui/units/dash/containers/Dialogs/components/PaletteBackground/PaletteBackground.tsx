import React from 'react';

import {type RealTheme} from '@gravity-ui/uikit';
import {
    BASE_GREY_BACKGROUND_COLOR,
    CustomPaletteBgColors,
    WIDGET_BG_COLORS_PRESET,
    WIDGET_BG_HEAVY_COLORS_PRESET,
} from 'shared/constants/widgets';

import {ColorPalette} from '../ColorPalette/ColorPalette';

type PaletteBackgroundProps = {
    color?: string;
    onSelect: (color: string) => void;
    enableCustomBgColorSelector?: boolean;
    theme?: RealTheme;
};

export const PaletteBackground = ({
    onSelect,
    color,
    enableCustomBgColorSelector,
    theme,
}: PaletteBackgroundProps) => {
    const mainPresetOptions = [
        CustomPaletteBgColors.NONE,
        CustomPaletteBgColors.LIKE_CHART,
        enableCustomBgColorSelector ? BASE_GREY_BACKGROUND_COLOR : '',
    ].filter(Boolean);

    const paletteOptions = WIDGET_BG_COLORS_PRESET.concat(
        enableCustomBgColorSelector ? WIDGET_BG_HEAVY_COLORS_PRESET : [],
    );

    return (
        <ColorPalette
            onSelect={onSelect}
            color={color}
            enableCustomBgColorSelector={enableCustomBgColorSelector}
            mainPresetOptions={mainPresetOptions}
            paletteOptions={paletteOptions}
            theme={theme}
        />
    );
};
