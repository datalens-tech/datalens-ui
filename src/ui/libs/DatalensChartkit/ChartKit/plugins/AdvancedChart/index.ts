import React from 'react';

import type {ChartKitPlugin} from '@gravity-ui/chartkit';

export const AdvancedChartPlugin = {
    type: 'advanced-chart',
    renderer: React.lazy(() => import('./renderer/AdvancedChartWidget')),
} as unknown as ChartKitPlugin;
