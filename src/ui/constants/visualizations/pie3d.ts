import type {GraphShared} from 'shared';
import {WizardVisualizationId} from 'shared';

import {PIE_VISUALIZATION} from './pie';

export const PIE_3D_VISUALIZATION: GraphShared['visualization'] = {
    ...PIE_VISUALIZATION,
    id: WizardVisualizationId.Pie3D,
    highchartsId: 'pie',
    name: 'label_visualization-pie-3d',
    hidden: false,
    iconProps: {id: 'visPie', width: '24'},
};
