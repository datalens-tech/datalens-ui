import {GraphShared, WizardVisualizationId} from '../../../shared';

import {SCATTER_VISUALIZATION} from './line';

export const SCATTER_D3_VISUALIZATION: GraphShared['visualization'] = {
    ...SCATTER_VISUALIZATION,
    id: WizardVisualizationId.ScatterD3,
    allowShapes: false,
    allowComments: false,
};
