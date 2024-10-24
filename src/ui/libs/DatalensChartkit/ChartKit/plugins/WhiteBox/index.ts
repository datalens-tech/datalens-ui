import React from 'react';

import type {ChartKitPlugin} from '@gravity-ui/chartkit';

export const WhiteBoxPlugin = {
    type: 'white-box',
    renderer: React.lazy(() => import('./renderer/WhiteBoxWidget')),
} as unknown as ChartKitPlugin;
