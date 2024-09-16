import {createContext} from 'react';

import type {Config, ItemsStateAndParams} from '@gravity-ui/dashkit';
import type {DashSettingsGlobalParams, DashTab} from 'shared/types';

export const DashControlsConfigContext = createContext<{
    config?: Config | DashTab;
    itemsStateAndParams?: ItemsStateAndParams;
    skipReload: boolean;
    isNewRelations: boolean;
    defaultGlobalParams?: DashSettingsGlobalParams;
} | null>(null);
