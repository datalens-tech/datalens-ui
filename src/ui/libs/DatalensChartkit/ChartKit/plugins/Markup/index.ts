import React from 'react';

import {ChartKitPlugin} from '@gravity-ui/chartkit';

export const MarkupPlugin: ChartKitPlugin = {
    type: 'markup',
    renderer: React.lazy(() => import('./renderer/MarkupWidget')),
};
