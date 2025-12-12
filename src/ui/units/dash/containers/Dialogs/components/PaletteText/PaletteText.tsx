import React from 'react';

import type {FlexProps, RealTheme} from '@gravity-ui/uikit';
import {type ColorSettings, Feature} from 'shared';
import {CustomPaletteTextColors, TITLE_WIDGET_TEXT_COLORS_PRESET} from 'shared/constants/widgets';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';
import {computeColorFromToken} from 'ui/utils/widgetColors';

import {ColorInputsGroup} from '../ColorInputsGroup/ColorInputsGroup';
import {ColorPicker} from '../ColorPicker/ColorPicker';

type PaletteTextProps = {
    color: ColorSettings | undefined;
    oldColor: string | undefined;
    onSelect: (color: ColorSettings | undefined) => void;
    onSelectOldColor: (color: string) => void;
    theme?: RealTheme;
    enableCustomColorSelector?: boolean;
    enableSeparateThemeColorSelector?: boolean;
    direction?: FlexProps['direction'];
};
const mainPresetOptions = [
    CustomPaletteTextColors.PRIMARY,
    CustomPaletteTextColors.COMPLEMENTARY,
    CustomPaletteTextColors.SECONDARY,
    CustomPaletteTextColors.HINT,
    CustomPaletteTextColors.INVERTED_PRIMARY,
];
const isCommonDashSettingsEnabled = isEnabledFeature(Feature.EnableDashColorPickersByTheme);
export const PaletteText = ({
    onSelect,
    onSelectOldColor,
    color,
    oldColor,
    theme,
    enableCustomColorSelector,
    enableSeparateThemeColorSelector = true,
    direction = 'row',
}: PaletteTextProps) => {
    if (isCommonDashSettingsEnabled || color) {
        return (
            <ColorInputsGroup
                theme={theme}
                value={color ?? computeColorFromToken(oldColor)}
                onUpdate={onSelect}
                isSingleColorSelector={!enableSeparateThemeColorSelector}
                direction={direction}
            />
        );
    }

    return (
        <ColorPicker
            onSelect={onSelectOldColor}
            color={oldColor}
            enableCustomColorSelector={enableCustomColorSelector}
            mainPresetOptions={mainPresetOptions}
            paletteOptions={TITLE_WIDGET_TEXT_COLORS_PRESET}
            theme={theme}
            paletteColumns={6}
        />
    );
};
