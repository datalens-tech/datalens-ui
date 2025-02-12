import {createContext} from 'react';

import type {Config} from '@gravity-ui/dashkit';
import type {DashChartRequestContext, DashSettingsGlobalParams, DashTab} from 'shared/types';

export const ExtendedDashKitContext = createContext<{
    config?: Config | DashTab;
    skipReload: boolean;
    isNewRelations: boolean;
    defaultGlobalParams?: DashSettingsGlobalParams;
    hideErrorDetails?: boolean;
    selectorsGroupTitlePlaceholder?: string;
    dataProviderContextGetter?: (widgetId: string) => DashChartRequestContext;
    setWidgetCurrentTab?: (payload: {widgetId: string; tabId: string}) => void;
} | null>(null);
