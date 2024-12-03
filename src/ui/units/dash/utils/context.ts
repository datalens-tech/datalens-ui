import {createContext} from 'react';

import type {Config} from '@gravity-ui/dashkit';
import type {DashChartRequestContext, DashSettingsGlobalParams, DashTab} from 'shared/types';

export const ExtendedDashKitContext = createContext<{
    config?: Config | DashTab;
    skipReload: boolean;
    isNewRelations: boolean;
    defaultGlobalParams?: DashSettingsGlobalParams;
    hideErrorDetails?: boolean;
    dataProviderContextGetter?: () => DashChartRequestContext;
    setWidgetCurrentTab?: (payload: {widgetId: string; tabId: string}) => void;
} | null>(null);
