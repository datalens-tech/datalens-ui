import {LineShapeType} from '..';
import type {SmoothingLineSettings, TrendLineSettings} from '../types';

export const DEFAULT_SMOOTHING: SmoothingLineSettings = {
    method: 'sma',
    windowSize: 7,
    colorMode: 'similar',
    lineWidth: 2,
};

export const DEFAULT_TREND_SETTINGS: TrendLineSettings = {
    method: 'linear',
    colorMode: 'similar',
    dashStyle: LineShapeType.Dash,
    lineWidth: 2,
};
