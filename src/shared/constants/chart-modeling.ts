import {LineShapeType} from '..';
import type {SmoothingLineSettings, TrendLineSettings} from '../types';

export const DEFAULT_SMOOTHING: SmoothingLineSettings = {
    method: 'sma',
    windowSize: 7,
    lineWidth: 2,
    linked: true,
};

export const DEFAULT_TREND_SETTINGS: TrendLineSettings = {
    method: 'linear',
    dashStyle: LineShapeType.Dash,
    lineWidth: 2,
    linked: true,
};
