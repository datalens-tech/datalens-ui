import {createContext} from 'react';

import type {Config} from '@gravity-ui/dashkit';

export const DashConfigContext = createContext<Config | null>(null);
