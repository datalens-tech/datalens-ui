import {I18n} from 'i18n';

import {LOAD_STATUS} from '../../../Control/constants';

import {
    Action,
    CONTROL_SET_ERROR_DATA,
    CONTROL_SET_IS_INIT,
    CONTROL_SET_LOADED_DATA,
    CONTROL_SET_LOADING_ITEMS,
    CONTROL_SET_STATUS,
    CONTROL_SET_VALIDATION_ERROR,
    State,
} from './types';

const i18n = I18n.keyset('dash.dashkit-plugin-control.view');

export const getInitialState = (): State => ({
    status: LOAD_STATUS.INITIAL,
    loadedData: null,
    errorData: null,
    loadingItems: false,
    validationError: null,
    isInit: false,
});

export const reducer = (state: State, action: Action) => {
    switch (action.type) {
        case CONTROL_SET_LOADED_DATA: {
            const {status, loadedData} = action.payload;

            return {...state, status, loadedData, loadingItems: false, isInit: true};
        }
        case CONTROL_SET_ERROR_DATA: {
            const {status, errorData} = action.payload;

            return {...state, status, errorData, loadingItems: false, isInit: true};
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

        default: {
            return state;
        }
    }
};
