import type {ThemeType} from '@gravity-ui/uikit';
import {color as d3Color} from 'd3-color';

export function getFixedHeaderBackgroundColor(dashBgColor: string, _themeType: ThemeType) {
    return d3Color(dashBgColor)?.darker(0.2)?.formatHex8();
}
