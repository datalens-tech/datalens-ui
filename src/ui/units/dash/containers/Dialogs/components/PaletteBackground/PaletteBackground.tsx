import React from 'react';

import type {FlexProps, RealTheme} from '@gravity-ui/uikit';
import type {ColorByTheme} from 'shared';
import {Feature, isColorByTheme, isColorByThemeOrUndefined} from 'shared';
import {
    BASE_GREY_BACKGROUND_COLOR,
    CustomPaletteBgColors,
    WIDGET_BG_COLORS_PRESET,
    WIDGET_BG_HEAVY_COLORS_PRESET,
} from 'shared/constants/widgets';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {ColorInputsGroup} from '../ColorInputsGroup/ColorInputsGroup';
import {ColorPicker} from '../ColorPicker/ColorPicker';

type PaletteBackgroundProps = {
    color?: string | ColorByTheme;
    onSelect: (color: string | ColorByTheme) => void;
    enableCustomBgColorSelector?: boolean;
    theme?: RealTheme;
    enableSeparateThemeColorSelector?: boolean;
    direction?: FlexProps['direction'];
};
const isCommonDashSettingsEnabled = isEnabledFeature(Feature.EnableCommonChartDashSettings);

const MAIN_PRESET_OPTIONS = [
    'var(--g-color-base-background)',
    CustomPaletteBgColors.NONE,
    'var(--g-color-private-cool-grey-20-solid)',
];

const PALETTE_OPTIONS = [
    'var(--g-color-private-blue-50)',
    'var(--g-color-private-green-50)',
    'var(--g-color-private-yellow-50)',
    'var(--g-color-private-red-50)',
    'var(--g-color-private-purple-50)',
];

export const PaletteBackground = ({
    onSelect,
    color,
    enableCustomBgColorSelector,
    theme,
    enableSeparateThemeColorSelector = true,
    direction = 'row',
}: PaletteBackgroundProps) => {
    const mainPresetOptions = [
        CustomPaletteBgColors.NONE,
        CustomPaletteBgColors.LIKE_CHART,
        enableCustomBgColorSelector ? BASE_GREY_BACKGROUND_COLOR : '',
    ].filter(Boolean);

    const paletteOptions = React.useMemo(
        () =>
            WIDGET_BG_COLORS_PRESET.concat(
                enableCustomBgColorSelector ? WIDGET_BG_HEAVY_COLORS_PRESET : [],
            ),
        [enableCustomBgColorSelector],
    );

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
                direction={direction}
                mainPresetOptions={MAIN_PRESET_OPTIONS}
                paletteOptions={PALETTE_OPTIONS}
            />
        );
    }

    return (
        <ColorPicker
            onSelect={onSelect}
            color={/* color */ ''}
            enableCustomColorSelector={enableCustomBgColorSelector}
            mainPresetOptions={mainPresetOptions}
            paletteOptions={paletteOptions}
            theme={theme}
            paletteColumns={7}
        />
    );
};
