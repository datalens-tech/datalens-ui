import {WizardVisualizationId} from '../..';

const TOOLTIP_SUM_SUPPORTED_VISUALIZATION = new Set<string>([
    WizardVisualizationId.Line,
    WizardVisualizationId.Area,
    WizardVisualizationId.Area100p,
    WizardVisualizationId.Column,
    WizardVisualizationId.Column100p,
    WizardVisualizationId.Bar,
    WizardVisualizationId.Bar100p,
]);

export function isTooltipSumEnabled({visualizationId}: {visualizationId: string}) {
    return TOOLTIP_SUM_SUPPORTED_VISUALIZATION.has(visualizationId);
}
