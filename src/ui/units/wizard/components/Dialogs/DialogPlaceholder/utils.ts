import {WizardVisualizationId} from '../../../../../../shared';
import {isD3Visualization} from '../../../utils/visualization';

export function isAxisScaleEnabled(visualizationId: WizardVisualizationId) {
    return !isD3Visualization(visualizationId);
}

export function isAxisTypeEnabled(visualizationId: WizardVisualizationId) {
    return !isD3Visualization(visualizationId);
}

export function isAxisFormatEnabled(visualizationId: WizardVisualizationId) {
    return !isD3Visualization(visualizationId);
}

export function isAxisLabelsRotationEnabled(visualizationId: WizardVisualizationId) {
    return !isD3Visualization(visualizationId);
}

export function isHolidaysEnabled(visualizationId: WizardVisualizationId) {
    return !isD3Visualization(visualizationId);
}
