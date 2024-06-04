import type {GraphShared} from '../../../shared';
import {WizardVisualizationId} from '../../../shared';

import {COLUMN_VISUALIZATION} from './line';

export const BAR_X_D3_VISUALIZATION: GraphShared['visualization'] = {
    ...COLUMN_VISUALIZATION,
    id: WizardVisualizationId.BarXD3,
    allowSegments: false,
};
