import React from 'react';

import {type RealTheme} from '@gravity-ui/uikit';
import {CustomPaletteTextColors, TITLE_WIDGET_TEXT_COLORS_PRESET} from 'shared/constants/widgets';

import {ColorPalette} from '../ColorPalette/ColorPalette';

type PaletteTextProps = {
    color?: string;
    onSelect: (color: string) => void;
    theme?: RealTheme;
    enableCustomColorSelector?: boolean;
};
const mainPresetOptions = [
    CustomPaletteTextColors.PRIMARY,
    CustomPaletteTextColors.COMPLEMENTARY,
    CustomPaletteTextColors.SECONDARY,
    CustomPaletteTextColors.HINT,
    CustomPaletteTextColors.INVERTED_PRIMARY,
];

export const PaletteText = ({
    onSelect,
    color,
    theme,
    enableCustomColorSelector,
}: PaletteTextProps) => {
    return (
        <ColorPalette
            onSelect={onSelect}
            color={color}
            enableCustomColorSelector={enableCustomColorSelector}
            mainPresetOptions={mainPresetOptions}
            paletteOptions={TITLE_WIDGET_TEXT_COLORS_PRESET}
            theme={theme}
            paletteColumns={6}
        />
    );
};
