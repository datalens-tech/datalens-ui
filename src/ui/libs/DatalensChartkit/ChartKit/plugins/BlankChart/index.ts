import React from 'react';

import type {ChartKitPlugin} from '@gravity-ui/chartkit';

export const BlankChartPlugin = {
    type: 'blank-chart',
    renderer: React.lazy(() => import('./renderer/BlankChartWidget')),
} as unknown as ChartKitPlugin;
