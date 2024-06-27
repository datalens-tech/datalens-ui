import {I18n} from 'i18n';
import type {ActiveControl} from 'ui/libs/DatalensChartkit/types';

import {LOAD_STATUS} from '../../../Control/constants';

import type {Action, State} from './types';
import {
    CONTROL_SET_ERROR_DATA,
    CONTROL_SET_IS_INIT,
    CONTROL_SET_LOADED_DATA,
    CONTROL_SET_LOADING_ITEMS,
    CONTROL_SET_SILENT_LOADER,
    CONTROL_SET_STATUS,
    CONTROL_SET_VALIDATION_ERROR,
} from './types';

const i18n = I18n.keyset('dash.dashkit-plugin-control.view');

export const getInitialState = (): State => {
    return {
        status: LOAD_STATUS.INITIAL,
        loadedData: null,
        errorData: null,
        loadingItems: false,
        validationError: null,
        isInit: false,
        showSilentLoader: false,
        control: null,
    };
};

export const reducer = (state: State, action: Action) => {
    switch (action.type) {
        case CONTROL_SET_LOADED_DATA: {
            const {status, loadedData} = action.payload;

            loadedData.uiScheme = Array.isArray(loadedData.uiScheme)
                ? {controls: loadedData.uiScheme}
                : loadedData.uiScheme;

            const control = loadedData.uiScheme
                ? (loadedData.uiScheme.controls[0] as ActiveControl)
                : null;

            return {
                ...state,
                status,
                loadedData,
                loadingItems: false,
                showSilentLoader: false,
                control,
            };
        }

        case CONTROL_SET_ERROR_DATA: {
            const {status, errorData} = action.payload;

            return {
                ...state,
                status,
                errorData,
                loadingItems: false,
                showSilentLoader: false,
            };
        }

        case CONTROL_SET_LOADING_ITEMS: {
            return {...state, loadingItems: action.payload.loadingItems};
        }

        case CONTROL_SET_VALIDATION_ERROR: {
            if (action.payload.hasError) {
                return {...state, validationError: i18n('value_required')};
            }

            if (state.validationError) {
                return {...state, validationError: null};
            }

            return state;
        }

        case CONTROL_SET_STATUS: {
            return {...state, status: action.payload.status};
        }

        case CONTROL_SET_IS_INIT: {
            return {...state, isInit: action.payload.isInit};
        }

        case CONTROL_SET_SILENT_LOADER: {
            if (state.status === LOAD_STATUS.PENDING && action.payload.silentLoading) {
                return {...state, showSilentLoader: true};
            }

            return state;
        }

        default: {
            return state;
        }
    }
};
