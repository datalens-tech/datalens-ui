import {color as d3Color} from 'd3-color';
import type {ColorByTheme} from 'shared';
import {
    CustomPaletteBgColors,
    Feature,
    LIKE_CHART_COLOR_TOKEN,
    TRANSPARENT_COLOR_HEX,
    getColorObject,
} from 'shared';

import {isEnabledFeature} from './isEnabledFeature';

const isCommonDashSettingsEnabled = isEnabledFeature(Feature.EnableCommonChartDashSettings);

export function computeColorFromToken(token?: string) {
    if (!token) {
        return undefined;
    }

    const div = document.createElement('div');
    div.style.backgroundColor = token;
    div.style.position = 'absolute';
    div.style.top = '-1000px';
    div.style.left = '-1000px';
    div.style.width = '0';
    div.style.height = '0';
    document.body.appendChild(div);
    const color = getComputedStyle(div).backgroundColor;
    return d3Color(color) ? color : undefined;
}

export function getWidgetColors({
    color,
    enabled = true,
    defaultOldColor = CustomPaletteBgColors.NONE,
    enableMultiThemeColors = true,
}: {
    color?: string | ColorByTheme;
    enabled?: boolean;
    defaultOldColor: string;
    enableMultiThemeColors: boolean;
}): ColorByTheme | string | undefined {
    const defaultColor =
        defaultOldColor === CustomPaletteBgColors.LIKE_CHART
            ? LIKE_CHART_COLOR_TOKEN
            : defaultOldColor === CustomPaletteBgColors.NONE
              ? TRANSPARENT_COLOR_HEX
              : defaultOldColor;
    const defaultColorComputed = computeColorFromToken(defaultColor);
    const allowCustomValues = !enableMultiThemeColors;
    if (isCommonDashSettingsEnabled) {
        if (typeof color === 'string') {
            let colorComputed: string | undefined;
            if (enabled === false) {
                colorComputed = defaultColorComputed;
            } else if (color && !d3Color(color)) {
                // if color token var
                colorComputed = computeColorFromToken(color);
            } else {
                colorComputed = color;
            }
            return getColorObject(colorComputed, enableMultiThemeColors);
        }
        return color ?? getColorObject(undefined, enableMultiThemeColors);
    } else if (typeof color === 'string') {
        if (enabled === false) {
            return defaultColor;
        } else {
            // if user-defined hex color
            if (
                !allowCustomValues &&
                color !== CustomPaletteBgColors.NONE &&
                color &&
                d3Color(color)
            ) {
                return defaultColor;
            }
            return color ?? defaultOldColor;
        }
    }
    return color;
}
