import reverse from 'lodash/reverse';

import type {ServerChartsConfig, ServerColor} from '../../../../../../../shared';
import {WizardVisualizationId, isDimensionField} from '../../../../../../../shared';
import type {ChartColorsConfig} from '../../types';
import {getGradientStops} from '../../utils/get-gradient-stops';
import {isGradientMode} from '../../utils/misc-helpers';

export function shouldUseGradientLegend(
    colorField: ServerColor | undefined,
    colorsConfig: ChartColorsConfig,
    shared: ServerChartsConfig,
) {
    if (!colorField) {
        return false;
    }

    const isCombinedChartColorizedBySomeDimenstion =
        shared.visualization.id === WizardVisualizationId.CombinedChart &&
        shared.visualization.layers?.some((layer) =>
            layer.commonPlaceholders.colors.some(isDimensionField),
        );

    const isGradient = isGradientMode({
        colorField,
        colorFieldDataType: colorField.data_type,
        colorsConfig,
    });

    return isGradient && !isCombinedChartColorizedBySomeDimenstion;
}

export function getLegendColorScale({
    colorsConfig,
    minColorValue,
    maxColorValue,
    points,
}: {
    colorsConfig: ChartColorsConfig;
    minColorValue: number | undefined;
    maxColorValue: number | undefined;
    points: {colorValue?: unknown}[];
}) {
    let colorScaleColors = colorsConfig.gradientColors;
    if (colorsConfig.reversed) {
        colorScaleColors = reverse(colorScaleColors);
    }

    let stops = colorsConfig.gradientColors.length === 2 ? [0, 1] : [0, 0.5, 1];
    if (colorsConfig && typeof minColorValue === 'number' && typeof maxColorValue === 'number') {
        stops = getGradientStops({colorsConfig, points, minColorValue, maxColorValue});
    }

    if (stops[0] > 0) {
        stops.unshift(0);
        colorScaleColors.unshift(colorScaleColors[0]);
    }

    if (stops[stops.length - 1] < 1) {
        stops.push(1);
        colorScaleColors.push(colorScaleColors[colorScaleColors.length - 1]);
    }
    return {colors: colorScaleColors, stops};
}
