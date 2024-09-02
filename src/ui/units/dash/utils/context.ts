import {createContext} from 'react';

import type {DashSettingsGlobalParams, DashTab} from 'shared/types';

export const DashControlsConfigContext = createContext<{
    config?: DashTab;
    skipReload: boolean;
    isNewRelations: boolean;
    defaultGlobalParams?: DashSettingsGlobalParams;
} | null>(null);
