import {
    ServerVisualization,
    WizardVisualizationId,
    isVisualizationWithLayers,
} from '../../../../../../../shared';

export function getAllVisualizationsIds(config: {visualization: ServerVisualization}) {
    return isVisualizationWithLayers(config.visualization)
        ? config.visualization.layers.map((l) => l.id as WizardVisualizationId)
        : [config.visualization.id as WizardVisualizationId];
}
