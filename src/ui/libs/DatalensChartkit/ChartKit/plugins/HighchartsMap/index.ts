import React from 'react';

import type {ChartKitPlugin} from '@gravity-ui/chartkit';

export const HighchartsMapPlugin: ChartKitPlugin = {
    type: 'highchartsmap',
    renderer: React.lazy(() => import('./renderer/HighchartsMapWidget')),
};
