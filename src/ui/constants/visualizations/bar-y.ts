import type {GraphShared} from '../../../shared';
import {WizardVisualizationId} from '../../../shared';

import {BAR_100P_VISUALIZATION, BAR_VISUALIZATION} from './line';

export const BAR_Y_D3_VISUALIZATION: GraphShared['visualization'] = {
    ...BAR_VISUALIZATION,
    id: WizardVisualizationId.BarYD3,
};

export const BAR_Y_100P_D3_VISUALIZATION: GraphShared['visualization'] = {
    ...BAR_100P_VISUALIZATION,
    id: WizardVisualizationId.BarY100pD3,
};
