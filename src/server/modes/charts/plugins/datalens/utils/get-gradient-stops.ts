import {GradientType} from '../../../../../../shared';
import type {ChartColorsConfig} from '../types';

import {getCurrentGradient, getRgbColors, getThresholdValues} from './color-helpers';

type GetGradientStopsArgs = {
    colorsConfig: ChartColorsConfig;
    points: Highcharts.PointOptionsObject[];
    minColorValue: number;
    maxColorValue: number;
};

export function getGradientStops(args: GetGradientStopsArgs): [number, string][] {
    const {colorsConfig, points, minColorValue, maxColorValue} = args;
    const colorValues = points.map((point) =>
        typeof point.colorValue === 'number' ? point.colorValue : null,
    );
    const {mid, min, max} = getThresholdValues(colorsConfig, colorValues);
    const colorValueRange = maxColorValue - minColorValue;

    let stops: number[] = [];
    if (colorsConfig.gradientMode === GradientType.TWO_POINT) {
        stops = [(min - minColorValue) / colorValueRange, (max - minColorValue) / colorValueRange];
    } else {
        stops = [
            (min - minColorValue) / colorValueRange,
            (mid - minColorValue) / colorValueRange,
            (max - minColorValue) / colorValueRange,
        ];
    }

    const gradient = getCurrentGradient(colorsConfig);
    const gradientColors = getRgbColors(gradient.colors, Boolean(colorsConfig.reversed));
    return gradientColors.map((color, i) => [
        stops[i],
        `rgb(${color.red}, ${color.green}, ${color.blue})`,
    ]);
}
