import {createContext} from 'react';

import type {Config} from '@gravity-ui/dashkit';
import type {DashTab} from 'shared/types';

export const DashConfigContext = createContext<Config | DashTab | null>(null);
