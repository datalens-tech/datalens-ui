import type {
    ServerChartsConfig,
    ServerColor,
    ServerField,
    ServerSort,
} from '../../../../../../../shared';
import {
    WizardVisualizationId,
    isDateField,
    isDimensionField,
    isNumberField,
} from '../../../../../../../shared';
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

export function getHighchartsColorAxis(
    graphs: any[],
    colorsConfig: ChartColorsConfig,
): Highcharts.ColorAxis {
    const points = graphs.reduce<Highcharts.PointOptionsObject[]>(
        (acc: Highcharts.PointOptionsObject[], graph) => [...acc, ...graph.data],
        [],
    );
    const colorValues = points
        .map((point) => point.colorValue)
        .filter((cv): cv is number => Boolean(cv));

    const minColorValue = Math.min(...colorValues);
    const maxColorValue = Math.max(...colorValues);

    return {
        startOnTick: false,
        endOnTick: false,
        min: minColorValue,
        max: maxColorValue,
        stops: getGradientStops({colorsConfig, points, minColorValue, maxColorValue}),
    };
}

export function isXAxisReversed(
    xField: ServerField | undefined,
    sortFields: ServerSort[],
    visualizationId: WizardVisualizationId,
) {
    if (isDateField(xField) || isNumberField(xField)) {
        const sortXItem = sortFields.find((s) => s.guid === xField.guid);
        if (sortXItem && (sortXItem.direction === 'DESC' || !sortXItem.direction)) {
            // It turns out that in order to expand the X-axis for a Bar chart in Highcharts, you need to pass false
            // While in all other types of charts you need to pass true
            return ![WizardVisualizationId.Bar, WizardVisualizationId.Bar100p].includes(
                visualizationId,
            );
        }
    }

    return undefined;
}
