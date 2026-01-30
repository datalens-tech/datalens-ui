import type {SmoothingLineSettings, TrendLineSettings} from '../types';

export const DEFAULT_SMOOTHING: SmoothingLineSettings = {
    method: 'sma',
    windowSize: 3,
    colorMode: 'similar',
};

export const DEFAULT_TREND_SETTINGS: TrendLineSettings = {
    method: 'linear',
};
