import type {Config} from '@gravity-ui/dashkit';
import type {DashChartRequestContext, DashSettingsGlobalParams, DashTab} from 'shared/types';

import type {UpdateTabsWithGlobalStateArgs} from '../store/typings/dash';

export type ExtendedDashKitContextType = {
    config?: Config | DashTab;
    skipReload: boolean;
    defaultGlobalParams?: DashSettingsGlobalParams;
    hideErrorDetails?: boolean;
    selectorsGroupTitlePlaceholder?: string;
    dataProviderContextGetter?: (widgetId: string) => DashChartRequestContext;
    setWidgetCurrentTab?: (payload: {widgetId: string; tabId: string}) => void;
    updateTabsWithGlobalState?: (payload: UpdateTabsWithGlobalStateArgs) => void;
};
