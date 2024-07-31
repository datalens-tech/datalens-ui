import {createContext} from 'react';

import type {EntryGlobalState} from 'ui/store/typings/entryContent';

export const DashConfigContext = createContext<EntryGlobalState | null>(null);
