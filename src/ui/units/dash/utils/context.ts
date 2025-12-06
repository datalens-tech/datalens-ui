import {createContext} from 'react';

import type {ExtendedDashKitContextType} from '../typings/context';

export const ExtendedDashKitContext = createContext<ExtendedDashKitContextType | null>(null);
