import React from 'react';

import type {ChartKitPlugin} from '@gravity-ui/chartkit';

export const MarkupPlugin: ChartKitPlugin = {
    type: 'markup',
    renderer: React.lazy(() => import('./renderer/MarkupWidget')),
};
