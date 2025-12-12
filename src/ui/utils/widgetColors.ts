import type {RealTheme} from '@gravity-ui/uikit';
import {color as d3Color} from 'd3-color';
import type {ColorSettings} from 'shared';
import {
    CustomPaletteBgColors,
    Feature,
    LIKE_CHART_COLOR_TOKEN,
    TRANSPARENT_COLOR_HEX,
    getColorSettingsWithValue,
} from 'shared';

import {isEnabledFeature} from './isEnabledFeature';

const isDashColorPickersByThemeEnabled = isEnabledFeature(Feature.EnableDashColorPickersByTheme);

export function computeColorFromToken(externalToken?: string, theme?: RealTheme) {
    if (!externalToken) {
        return undefined;
    }

    let token = externalToken;

    if (token === CustomPaletteBgColors.LIKE_CHART) {
        token = LIKE_CHART_COLOR_TOKEN;
    } else if (token === CustomPaletteBgColors.NONE) {
        token = TRANSPARENT_COLOR_HEX;
    } else if (d3Color(token)) {
        return d3Color(token)?.formatHex8();
    }

    const div = document.createElement('div');
    div.style.backgroundColor = token;
    div.style.position = 'absolute';
    div.style.top = '-1000px';
    div.style.left = '-1000px';
    div.style.width = '0';
    div.style.height = '0';

    let elem = div;

    if (theme) {
        elem = document.createElement('div');
        const classList = document.body.className
            .split(' ')
            .map((cls) => (cls.trim().startsWith('g-root_theme_') ? `g-root_theme_${theme}` : cls))
            .filter(Boolean);
        elem.classList.add('g-root', ...classList);

        elem.appendChild(div);
    }
    document.body.appendChild(elem);
    const color = getComputedStyle(div).backgroundColor;
    document.body.removeChild(elem);
    const d3ColorResult = d3Color(color);
    return d3ColorResult ? d3ColorResult.formatHex8() : undefined;
}

export function getWidgetColorSettings(args: {
    colorSettings?: ColorSettings;
    oldColor?: string;
    defaultOldColor: string;
    enableMultiThemeColors: boolean;
}): ColorSettings | undefined {
    const {colorSettings, oldColor, defaultOldColor, enableMultiThemeColors = true} = args;
    if (!isDashColorPickersByThemeEnabled && !colorSettings) {
        return undefined;
    }

    if (colorSettings) {
        return colorSettings;
    }

    if (oldColor) {
        return getColorSettingsWithValue(computeColorFromToken(oldColor), enableMultiThemeColors);
    }
    return getColorSettingsWithValue(
        computeColorFromToken(defaultOldColor),
        enableMultiThemeColors,
    );
}
