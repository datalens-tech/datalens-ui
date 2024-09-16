import {createContext} from 'react';

import type {DashTab} from 'shared/types';

export const DashConfigContext = createContext<DashTab | null>(null);
