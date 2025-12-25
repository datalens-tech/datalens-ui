import type {BarsAlignValues, BarsColorType, GradientType} from '../../constants';

export interface TableBarsSettings {
    enabled: boolean;
    colorSettings: BarGradientColorSettings | BarOneColorSettings | BarTwoColorSettings;
    showLabels: boolean;
    align: AlignValues;
    scale: BarAutoScaleSettings | BarManualScaleSettings;
    showBarsInTotals: boolean;
}

export type AlignValues = BarsAlignValues.Left | BarsAlignValues.Right | BarsAlignValues.Default;

export interface BarGradientColorSettings {
    colorType: BarsColorType.Gradient;
    settings: {
        gradientType: GradientType;
        thresholds:
            | {
                  mode: 'manual';
                  min: string;
                  mid?: string;
                  max: string;
              }
            | {mode: 'auto'};
        palette: string;
        reversed: boolean;
    };
}

// TODO: use either index or color
// type BarOneColorByIndex = {
//     colorIndex: number;
//     color?: undefined;
// };

// type BarOneColorByColor = {
//     colorIndex?: undefined;
//     color: string;
// };

export interface BarOneColorSettings {
    colorType: BarsColorType.OneColor;
    settings: {
        palette: string;
        colorIndex?: number;
        color?: string;
    };
}

// type BarTwoColumnsPositiveByIndex = {
//     positiveColorIndex: number;
//     positiveColor?: undefined;
// };

// type BarTwoColumnsPositiveByColor = {
//     positiveColorIndex?: undefined;
//     positiveColor: string;
// };

// type BarTwoColumnsNegativeByIndex = {
//     negativeColorIndex: number;
//     negativeColor?: undefined;
// };

// type BarTwoColumnsNegativeByColor = {
//     negativeColorIndex?: undefined;
//     negativeColor: string;
// };

// type BatTwoColorsSettings = (BarTwoColumnsPositiveByIndex | BarTwoColumnsPositiveByColor) &
//     (BarTwoColumnsNegativeByIndex | BarTwoColumnsNegativeByColor);

export interface BarTwoColorSettings {
    colorType: BarsColorType.TwoColor;
    settings: {
        palette: string | undefined;
        negativeColorIndex?: number;
        negativeColor?: string;
        positiveColorIndex?: number;
        positiveColor?: string;
    };
}

export interface BarAutoScaleSettings {
    mode: 'auto';
}

export interface BarManualScaleSettings {
    mode: 'manual';
    settings: {
        min?: string;
        max?: string;
    };
}
