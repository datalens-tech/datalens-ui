import React from 'react';

import type {ChartKitPlugin} from '@gravity-ui/chartkit';

export const MetricPlugin: ChartKitPlugin = {
    type: 'metric',
    renderer: React.lazy(() => import('./renderer/MetricWidget')),
};
