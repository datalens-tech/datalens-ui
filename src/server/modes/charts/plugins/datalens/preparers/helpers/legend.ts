import type {ServerChartsConfig, ServerColor} from '../../../../../../../shared';
import {WizardVisualizationId, isDimensionField} from '../../../../../../../shared';
import type {ChartColorsConfig} from '../../types';
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
