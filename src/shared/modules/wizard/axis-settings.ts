import {PERCENT_VISUALIZATIONS, PlaceholderId, WizardVisualizationId} from '../../constants';
import type {ServerChartsConfig} from '../../types';
import {AxisNullsMode} from '../../types';
import {isDimensionField} from '../helpers';

export function getAxisNullsSettings(value: AxisNullsMode, visualizationId: string) {
    const isArea =
        visualizationId === WizardVisualizationId.Area ||
        visualizationId === WizardVisualizationId.Area100p;
    const defaultValue = isArea ? AxisNullsMode.AsZero : AxisNullsMode.Connect;
    const isCurrentValueValid = value && !(value === AxisNullsMode.UsePrevious && !isArea);

    if (isCurrentValueValid) {
        return value;
    }

    return defaultValue;
}

function isStackingConfigured({chartConfig}: {chartConfig: Partial<ServerChartsConfig>}) {
    const xFields =
        chartConfig.visualization?.placeholders?.find((p) => p.id === PlaceholderId.X)?.items ?? [];
    const colorField = chartConfig.colors?.[0];
    return isDimensionField(colorField) && !xFields.some((item) => item.guid === colorField?.guid);
}

export function isMinMaxYScaleDisabled({
    chartConfig,
}: {
    chartConfig: Partial<ServerChartsConfig> | undefined;
}) {
    const visualizationId = chartConfig?.visualization?.id;
    if (!visualizationId) {
        return true;
    }
    const isPercentVisualization = PERCENT_VISUALIZATIONS.has(visualizationId);

    return isPercentVisualization || isStackingConfigured({chartConfig});
}
