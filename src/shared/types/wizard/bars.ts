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

export interface BarOneColorSettings {
    colorType: BarsColorType.OneColor;
    settings: {
        palette: string;
        color: string;
        colorIndex?: number | null;
    };
}

export interface BarTwoColorSettings {
    colorType: BarsColorType.TwoColor;
    settings: {
        palette: string;
        positiveColor: string;
        negativeColor: string;
        positiveColorIndex?: number | null;
        negativeColorIndex?: number | null;
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
