import React from 'react';

import type {ChartKitPlugin} from '@gravity-ui/chartkit';

export const TablePlugin = {
    type: 'table',
    renderer: React.lazy(() => import('./renderer/TableWidget')),
} as unknown as ChartKitPlugin;
