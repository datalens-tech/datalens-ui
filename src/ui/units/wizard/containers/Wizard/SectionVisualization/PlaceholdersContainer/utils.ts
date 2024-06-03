import type {WizardVisualizationId} from '../../../../../../../shared';
import {getAvailableQlVisualizations} from '../../../../../ql/utils/visualization';
import {getAvailableVisualizations} from '../../../../utils/visualization';

export function getVisualizationById(id: WizardVisualizationId, qlMode = false) {
    const list = qlMode ? getAvailableQlVisualizations() : getAvailableVisualizations();
    return list.find((item) => item.id === id);
}
