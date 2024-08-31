import {createContext} from 'react';

import type {Config} from '@gravity-ui/dashkit';
import type {DashSettingsGlobalParams, DashTab} from 'shared/types';

export const DashControlsConfigContext = createContext<{
    config?: Config | DashTab;
    skipReload: boolean;
    isNewRelations: boolean;
    defaultGlobalParams?: DashSettingsGlobalParams;
} | null>(null);
