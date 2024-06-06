import React from 'react';

import type {ChartKitPlugin} from '@gravity-ui/chartkit';

export const YandexMapPlugin: ChartKitPlugin = {
    type: 'yandexmap',
    renderer: React.lazy(() => import('./renderer/YandexMapWidget')),
};
