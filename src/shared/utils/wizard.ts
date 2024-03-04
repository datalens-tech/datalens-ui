import {WizardVisualizationId} from '../constants';
import type {ExtendedChartsConfig, VisualizationWithLayersShared} from '../types';

export function isVisualizationWithLayers(
    visualization: ExtendedChartsConfig['visualization'] | undefined,
): visualization is VisualizationWithLayersShared['visualization'] {
    return [WizardVisualizationId.Geolayer, WizardVisualizationId.CombinedChart].includes(
        visualization?.id as WizardVisualizationId,
    );
}
