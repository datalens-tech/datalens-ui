import type {Action, State} from './types';
import {
    WIDGET_CHART_RESET_CHANGED_PARAMS,
    WIDGET_CHART_SET_DATA_PARAMS,
    WIDGET_CHART_SET_LOADED_DATA,
    WIDGET_CHART_SET_LOADING,
    WIDGET_CHART_SET_LOAD_SETTINGS,
    WIDGET_CHART_SET_WIDGET_DATA,
    WIDGET_CHART_SET_WIDGET_ERROR,
    WIDGET_CHART_UPDATE_DATA_PARAMS,
} from './types';

export const getInitialState = (): State => {
    return {
        isLoading: false,
        isSilentReload: false,
        isReloadWithNoVeil: false,
        loadedData: null,
        widget: null,
        yandexMapAPIWaiting: null,
        error: null,
        changedParams: null,
        usedParams: null,
    };
};

export const reducer = (state: State, action: Action) => {
    switch (action.type) {
        case WIDGET_CHART_SET_LOAD_SETTINGS:
        case WIDGET_CHART_SET_WIDGET_ERROR:
        case WIDGET_CHART_SET_WIDGET_DATA: {
            return {
                ...state,
                ...action.payload,
            };
        }
        case WIDGET_CHART_SET_LOADING: {
            return {
                ...state,
                isLoading: action.payload,
            };
        }
        case WIDGET_CHART_SET_LOADED_DATA:
            return {
                ...state,
                loadedData: action.payload,
                isLoading: false,
                isSilentReload: false,
                isReloadWithNoVeil: false,
                error: null,
                usedParams: action.payload?.usedParams || null,
            };
        case WIDGET_CHART_SET_DATA_PARAMS: {
            return {
                ...state,
                changedParams: {
                    ...action.payload,
                },
            };
        }
        case WIDGET_CHART_UPDATE_DATA_PARAMS: {
            return {
                ...state,
                changedParams: {
                    ...state.changedParams,
                    ...action.payload,
                },
            };
        }
        case WIDGET_CHART_RESET_CHANGED_PARAMS: {
            const newData = action.payload || {};
            return {
                ...state,
                changedParams: newData,
            };
        }
        default: {
            return state;
        }
    }
};
