import {createContext} from 'react';

import type {Config, ItemParams} from '@gravity-ui/dashkit';
import type {
    DashChartRequestContext,
    DashSettingsGlobalParams,
    DashTab,
    DashTabItemControlData,
    DashTabItemGroupControlData,
} from 'shared/types';

export const ExtendedDashKitContext = createContext<{
    config?: Config | DashTab;
    skipReload: boolean;
    defaultGlobalParams?: DashSettingsGlobalParams;
    hideErrorDetails?: boolean;
    selectorsGroupTitlePlaceholder?: string;
    dataProviderContextGetter?: (widgetId: string) => DashChartRequestContext;
    setWidgetCurrentTab?: (payload: {widgetId: string; tabId: string}) => void;
    updateGlobalTabsState?: (payload: {
        params: ItemParams;
        selectorData?: DashTabItemGroupControlData | DashTabItemControlData;
        widgetId: string;
    }) => void;
} | null>(null);
