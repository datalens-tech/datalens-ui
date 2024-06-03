import type {Action, State} from './types';
import {
    CHARTKIT_DL_SET_DATA_PARAMS,
    CHARTKIT_DL_SET_LOADED_DATA,
    CHARTKIT_DL_SET_LOADING,
    CHARTKIT_DL_SET_WIDGET_DATA,
    CHARTKIT_DL_SET_WIDGET_ERROR,
} from './types';

export const getInitialState = (): State => {
    return {
        isLoading: false,
        isSilentReload: false,
        isReloadWithNoVeil: false,
        loadedData: null,
        widget: null,
        widgetRendering: null,
        yandexMapAPIWaiting: null,
        error: null,
        changedParams: null,
    };
};

export const reducer = (state: State, action: Action) => {
    switch (action.type) {
        case CHARTKIT_DL_SET_WIDGET_ERROR:
        case CHARTKIT_DL_SET_WIDGET_DATA: {
            return {
                ...state,
                ...action.payload,
            };
        }
        case CHARTKIT_DL_SET_LOADING: {
            return {
                ...state,
                isLoading: action.payload,
            };
        }
        case CHARTKIT_DL_SET_LOADED_DATA:
            return {
                ...state,
                loadedData: action.payload,
                isLoading: false,
            };
        case CHARTKIT_DL_SET_DATA_PARAMS: {
            return {
                ...state,
                changedParams: {
                    ...state.changedParams,
                    ...action.payload,
                },
            };
        }
        default: {
            return state;
        }
    }
};
