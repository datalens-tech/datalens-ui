import type React from 'react';

import type {ControlWidget} from 'ui/libs/DatalensChartkit/types';

import type {
    ChartsData,
    ChartsProps,
} from '../../../../libs/DatalensChartkit/modules/data-provider/charts';
import type {
    CombinedError,
    LoadedWidget,
    LoadedWidgetData,
} from '../../../../libs/DatalensChartkit/types';
import type {DataProps} from '../types';

export type State = {
    isLoading: boolean;
    isSilentReload: boolean;
    isReloadWithNoVeil: boolean;
    loadedData:
        | LoadedWidgetData<ChartsData>
        | (LoadedWidgetData<ChartsData> & ControlWidget & ChartsData['extra']);
    widget: LoadedWidget;
    yandexMapAPIWaiting: number | null;
    error: CombinedError | null;
    changedParams: ChartsProps['params'] | null;
    usedParams: ChartsProps['params'] | null;
};

export const WIDGET_CHART_SET_LOADING = Symbol('widgetChart/SET_LOADING');
type SetLoadingAction = {
    type: typeof WIDGET_CHART_SET_LOADING;
    payload: State['isLoading'];
};

export const WIDGET_CHART_SET_DATA_PARAMS = Symbol('widgetChart/SET_DATA_PARAMS');
type SetDataParamsAction = {
    type: typeof WIDGET_CHART_SET_DATA_PARAMS;
    payload: DataProps['params'];
};

export const WIDGET_CHART_UPDATE_DATA_PARAMS = Symbol('widgetChart/UPDATE_DATA_PARAMS');
type UpdateDataParamsAction = {
    type: typeof WIDGET_CHART_UPDATE_DATA_PARAMS;
    payload: DataProps['params'];
};

export const WIDGET_CHART_SET_LOADED_DATA = Symbol('widgetChart/SET_LOADED_DATA');
type SetLoadedDataAction = {
    type: typeof WIDGET_CHART_SET_LOADED_DATA;
    payload: State['loadedData'];
};

export const WIDGET_CHART_SET_WIDGET_DATA = Symbol('widgetChart/SET_WIDGET_DATA');
type SetWidgetDataAction = {
    type: typeof WIDGET_CHART_SET_WIDGET_DATA;
    payload: Pick<State, 'isReloadWithNoVeil' | 'widget' | 'yandexMapAPIWaiting'>;
};

export const WIDGET_CHART_RESET_CHANGED_PARAMS = Symbol('widgetChart/RESET_WIDGET_CHANGED_DATA');
type ResetChangedWidgetDataAction = {
    type: typeof WIDGET_CHART_RESET_CHANGED_PARAMS;
    payload?: State['changedParams'];
};

export const WIDGET_CHART_SET_LOAD_SETTINGS = Symbol('widgetChart/CHARTKIT_SET_LOAD_SETTINGS');
type SetLoadSettingsAction = {
    type: typeof WIDGET_CHART_SET_LOAD_SETTINGS;
    payload: Pick<State, 'isReloadWithNoVeil' | 'isSilentReload'>;
};

export const WIDGET_CHART_SET_WIDGET_ERROR = Symbol('widgetChart/SET_WIDGET_ERROR');
type SetWidgetErrorAction = {
    type: typeof WIDGET_CHART_SET_WIDGET_ERROR;
    payload: Pick<State, 'isReloadWithNoVeil' | 'isLoading' | 'isSilentReload' | 'error'>;
};

export type Action =
    | SetDataParamsAction
    | UpdateDataParamsAction
    | ResetChangedWidgetDataAction
    | SetLoadSettingsAction
    | SetLoadingAction
    | SetLoadedDataAction
    | SetWidgetDataAction
    | SetWidgetErrorAction;

export type Dispatch = React.Dispatch<Action>;
