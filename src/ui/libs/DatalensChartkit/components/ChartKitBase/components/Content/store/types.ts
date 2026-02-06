import type React from 'react';

import type {ChartContentWidgetData} from 'ui/libs/DatalensChartkit/types';

import type {ChartsProps} from '../../../../../modules/data-provider/charts';
import type {CombinedError, LoadedWidget} from '../../../../../types';
import type {DataProps} from '../../../types';

export type State = {
    isLoading: boolean;
    isSilentReload: boolean;
    isReloadWithNoVeil: boolean;
    loadedData: ChartContentWidgetData;
    widget: LoadedWidget;
    widgetRendering: number | null;
    yandexMapAPIWaiting: number | null;
    error: CombinedError | null;
    changedParams: ChartsProps['params'] | null;
};

export const CHARTKIT_DL_SET_LOADING = Symbol('chartkitDatalens/SET_LOADING');
type SetLoadingAction = {
    type: typeof CHARTKIT_DL_SET_LOADING;
    payload: State['isLoading'];
};

export const CHARTKIT_DL_SET_DATA_PARAMS = Symbol('chartkitDatalens/SET_DATA_PARAMS');
type SetDataParamsAction = {
    type: typeof CHARTKIT_DL_SET_DATA_PARAMS;
    payload: DataProps['params'];
};

export const CHARTKIT_DL_SET_LOADED_DATA = Symbol('chartkitDatalens/SET_LOADED_DATA');
type SetLoadedDataAction = {
    type: typeof CHARTKIT_DL_SET_LOADED_DATA;
    payload: State['loadedData'];
};

export const CHARTKIT_DL_SET_WIDGET_DATA = Symbol('chartkitDatalens/SET_WIDGET_DATA');
type SetWidgetDataAction = {
    type: typeof CHARTKIT_DL_SET_WIDGET_DATA;
    payload: Pick<
        State,
        'isReloadWithNoVeil' | 'widget' | 'widgetRendering' | 'yandexMapAPIWaiting'
    >;
};

export const CHARTKIT_DL_SET_WIDGET_ERROR = Symbol('chartkitDatalens/SET_WIDGET_ERROR');
type SetWidgetErrorAction = {
    type: typeof CHARTKIT_DL_SET_WIDGET_ERROR;
    payload: Pick<State, 'isReloadWithNoVeil' | 'isLoading' | 'isSilentReload' | 'error'>;
};

export type Action =
    | SetDataParamsAction
    | SetLoadingAction
    | SetLoadedDataAction
    | SetWidgetDataAction
    | SetWidgetErrorAction;

export type Dispatch = React.Dispatch<Action>;
