import React from 'react';

import {type RealTheme} from '@gravity-ui/uikit';
import {CustomPaletteTextColors, TITLE_WIDGET_TEXT_COLORS_PRESET} from 'shared/constants/widgets';

import {ColorPalette} from '../ColorPalette/ColorPalette';

type PaletteTextProps = {
    color?: string;
    onSelect: (color: string) => void;
    theme?: RealTheme;
};
const mainPresetOptions = [
    CustomPaletteTextColors.PRIMARY,
    CustomPaletteTextColors.COMPLEMENTARY,
    CustomPaletteTextColors.SECONDARY,
    CustomPaletteTextColors.HINT,
    CustomPaletteTextColors.BRAND,
];

export const PaletteText = ({onSelect, color, theme}: PaletteTextProps) => {
    return (
        <ColorPalette
            onSelect={onSelect}
            color={color}
            enableCustomBgColorSelector
            mainPresetOptions={mainPresetOptions}
            paletteOptions={TITLE_WIDGET_TEXT_COLORS_PRESET}
            theme={theme}
            showItemsBorder
            paletteColumns={6}
        />
    );
};
