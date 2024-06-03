import type React from 'react';

import type {WidgetLoadedData} from '../types';

export type WidgetState = {
    loadedData: WidgetLoadedData | null;
    loading: boolean;
    description: string | null;
    loadedDescription: string | null;
    scrollOffset: number | null;
};

export const PLUGIN_WIDGET_SET_DATA = Symbol('pluginWidget/SET_DATA');
type SetData = {
    type: typeof PLUGIN_WIDGET_SET_DATA;
    payload: Partial<WidgetState>;
};

export type Action = SetData;

export type Dispatch = React.Dispatch<Action>;
