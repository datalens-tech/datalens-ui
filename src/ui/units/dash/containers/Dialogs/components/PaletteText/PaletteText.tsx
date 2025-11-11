import React from 'react';

import {type RealTheme} from '@gravity-ui/uikit';
import {type ColorByTheme, Feature, isColorByTheme, isColorByThemeOrUndefined} from 'shared';
import {CustomPaletteTextColors, TITLE_WIDGET_TEXT_COLORS_PRESET} from 'shared/constants/widgets';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {ColorInputsGroup} from '../ColorInputsGroup/ColorInputsGroup';
import {ColorPicker} from '../ColorPicker/ColorPicker';

type PaletteTextProps = {
    color?: string | ColorByTheme;
    onSelect: (color: string | ColorByTheme) => void;
    theme?: RealTheme;
    enableCustomColorSelector?: boolean;
    enableSeparateThemeColorSelector?: boolean;
};
const mainPresetOptions = [
    CustomPaletteTextColors.PRIMARY,
    CustomPaletteTextColors.COMPLEMENTARY,
    CustomPaletteTextColors.SECONDARY,
    CustomPaletteTextColors.HINT,
    CustomPaletteTextColors.INVERTED_PRIMARY,
];
const isCommonDashSettingsEnabled = isEnabledFeature(Feature.EnableCommonChartDashSettings);
export const PaletteText = ({
    onSelect,
    color,
    theme,
    enableCustomColorSelector,
    enableSeparateThemeColorSelector = true,
}: PaletteTextProps) => {
    if (
        (isCommonDashSettingsEnabled && isColorByThemeOrUndefined(color)) ||
        isColorByTheme(color)
    ) {
        return (
            <ColorInputsGroup
                theme={theme}
                value={color}
                onUpdate={onSelect}
                isSingleColorSelector={!enableSeparateThemeColorSelector}
            />
        );
    }

    return (
        <ColorPicker
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
