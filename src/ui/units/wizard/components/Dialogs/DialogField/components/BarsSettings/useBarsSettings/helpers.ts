import type {BarGradientColorSettings, BarOneColorSettings, BarTwoColorSettings} from 'shared';
import {BarsColorType, GradientType} from 'shared';
import {getTenantDefaultColorPaletteId, selectDefaultClientGradient} from 'ui';

export const getDefaultGradientColorSettings = (): BarGradientColorSettings => {
    return {
        colorType: BarsColorType.Gradient,
        settings: {
            gradientType: GradientType.TWO_POINT,
            thresholds: {
                mode: 'auto',
            },
            palette: selectDefaultClientGradient(GradientType.TWO_POINT),
            reversed: false,
        },
    };
};

export const getDefaultOneColorSettings = (): BarOneColorSettings => {
    return {
        colorType: BarsColorType.OneColor,
        settings: {
            palette: getTenantDefaultColorPaletteId(),
            colorIndex: 0,
        },
    };
};

export const getDefaultTwoColorSettings = (): BarTwoColorSettings => {
    return {
        colorType: BarsColorType.TwoColor,
        settings: {
            palette: getTenantDefaultColorPaletteId(),
            positiveColorIndex: 2,
            negativeColorIndex: 1,
        },
    };
};
