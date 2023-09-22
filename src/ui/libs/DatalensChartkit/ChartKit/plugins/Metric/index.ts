import React from 'react';

import {ChartKitPlugin} from '@gravity-ui/chartkit';

export const MetricPlugin: ChartKitPlugin = {
    type: 'metric',
    renderer: React.lazy(() => import('./renderer/MetricWidget')),
};
