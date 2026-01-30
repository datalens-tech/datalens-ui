import React from 'react';

import type {FlexProps, RealTheme} from '@gravity-ui/uikit';
import type {ColorSettings} from 'shared';
import {Feature} from 'shared';
import {
    BASE_GREY_BACKGROUND_COLOR,
    CustomPaletteBgColors,
    WIDGET_BG_COLORS_PRESET,
    WIDGET_BG_HEAVY_COLORS_PRESET,
} from 'shared/constants/widgets';
import type {ColorPickerInputProps} from 'ui/components/ColorPickerInput/ColorPickerInput';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';
import {computeColorFromToken} from 'ui/utils/widgets/colors';

import {ColorInputsGroup} from '../ColorInputsGroup/ColorInputsGroup';
import {ColorPicker} from '../ColorPicker/ColorPicker';

type PaletteBackgroundProps = Pick<ColorPickerInputProps, 'placeholder'> & {
    color: ColorSettings | undefined;
    oldColor: string | undefined;
    onSelect: (color: ColorSettings | undefined) => void;
    onSelectOldColor: ((color: string) => void) | undefined;
    onBlur?: () => void;
    enableCustomBgColorSelector?: boolean;
    theme?: RealTheme;
    enableSeparateThemeColorSelector?: boolean;
    direction?: FlexProps['direction'];
    width?: 'max';
};
const isDashColorPickersByThemeEnabled = isEnabledFeature(Feature.EnableDashColorPickersByTheme);

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

const noop = () => {};

export const PaletteBackground = ({
    onSelect,
    onSelectOldColor,
    onBlur,
    color,
    oldColor,
    enableCustomBgColorSelector,
    theme,
    enableSeparateThemeColorSelector = true,
    direction = 'row',
    placeholder,
    width,
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

    if (isDashColorPickersByThemeEnabled || color) {
        return (
            <ColorInputsGroup
                theme={theme}
                placeholder={placeholder}
                value={color ?? computeColorFromToken(oldColor)}
                onUpdate={onSelect}
                onBlur={onBlur}
                isSingleColorSelector={!enableSeparateThemeColorSelector}
                direction={direction}
                mainPresetOptions={MAIN_PRESET_OPTIONS}
                paletteOptions={PALETTE_OPTIONS}
                width={width}
            />
        );
    }

    return (
        <ColorPicker
            onSelect={onSelectOldColor ?? noop}
            onBlur={onBlur}
            color={oldColor}
            enableCustomColorSelector={enableCustomBgColorSelector}
            mainPresetOptions={mainPresetOptions}
            paletteOptions={paletteOptions}
            theme={theme}
            paletteColumns={7}
        />
    );
};
