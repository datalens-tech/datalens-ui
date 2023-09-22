import {GraphShared} from 'shared';

import {PIE_VISUALIZATION} from './pie';

export const DONUT_VISUALIZATION: GraphShared['visualization'] = {
    ...PIE_VISUALIZATION,
    id: 'donut',
    highchartsId: 'pie',
    name: 'label_visualization-donut',
    hidden: false,
    iconProps: {id: 'visDonut', width: '24'},
};
