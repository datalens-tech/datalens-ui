import type {BarGradientColorSettings, BarOneColorSettings, BarTwoColorSettings} from 'shared';
import {BarsColorType, DEFAULT_PALETTE, GradientType} from 'shared';
import {selectDefaultClientGradient} from 'ui';

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
            palette: DEFAULT_PALETTE.id,
            color: DEFAULT_PALETTE.scheme[0],
        },
    };
};

export const getDefaultTwoColorSettings = (): BarTwoColorSettings => {
    return {
        colorType: BarsColorType.TwoColor,
        settings: {
            palette: DEFAULT_PALETTE.id,
            positiveColor: '#8AD554',
            negativeColor: '#FF3D64',
        },
    };
};
