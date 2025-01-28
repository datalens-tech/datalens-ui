import React from 'react';

import {
    CustomPaletteBgColors,
    WIDGET_BG_COLORS_PRESET,
    WIDGET_BG_HEAVY_COLORS_PRESET,
} from 'ui/constants/widgets';

import {ColorPalette} from '../ColorPalette/ColorPalette';

/** @deprecated  */
export const CustomPaletteColors = CustomPaletteBgColors;

type PaletteBackgroundProps = {
    color?: string;
    onSelect: (color: string) => void;
    enableCustomBgColorSelector?: boolean;
};

export const PaletteBackground = ({
    onSelect,
    color,
    enableCustomBgColorSelector,
}: PaletteBackgroundProps) => {
    const mainPresetOptions = [
        CustomPaletteBgColors.NONE,
        CustomPaletteBgColors.LIKE_CHART,
        enableCustomBgColorSelector ? 'var(--g-color-base-generic)' : '',
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
        />
    );
};
