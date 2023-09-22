import React from 'react';

import {ChartKitPlugin} from '@gravity-ui/chartkit';

export const HighchartsMapPlugin: ChartKitPlugin = {
    type: 'highchartsmap',
    renderer: React.lazy(() => import('./renderer/HighchartsMapWidget')),
};
