import type {ResetWizardStoreAction} from '../actions';
import type {SettingsAction} from '../actions/settings';
import {
    SET_DEFAULTS_SET,
    SET_ROUTE_WORKBOOK_ID,
    TOGGLE_FULLSCREEN,
    TOGGLE_NAVIGATION,
    TOGGLE_VIEW_ONLY_MODE,
} from '../actions/settings';

export interface SettingsState {
    isNavigationVisible: boolean;
    isFullscreen: boolean;
    defaultsSet: boolean;
    isViewOnlyMode: boolean;
    routeWorkbookId?: string;
}

const initialState: SettingsState = {
    isNavigationVisible: false,
    isFullscreen: false,
    defaultsSet: false,
    isViewOnlyMode: false,
};

export function settings(
    state = initialState,
    action: SettingsAction | ResetWizardStoreAction,
): SettingsState {
    switch (action.type) {
        case TOGGLE_NAVIGATION: {
            let {visible} = action;

            visible = typeof visible !== 'undefined' ? visible : !state.isNavigationVisible;

            return {
                ...state,
                isNavigationVisible: visible,
            };
        }
        case TOGGLE_FULLSCREEN: {
            return {
                ...state,
                isFullscreen: !state.isFullscreen,
            };
        }
        case TOGGLE_VIEW_ONLY_MODE: {
            return {
                ...state,
                isViewOnlyMode: !state.isViewOnlyMode,
                isFullscreen: !state.isViewOnlyMode,
            };
        }
        case SET_DEFAULTS_SET: {
            return {
                ...state,
                defaultsSet: true,
            };
        }
        case SET_ROUTE_WORKBOOK_ID: {
            return {
                ...state,
                routeWorkbookId: action.payload.routeWorkbookId,
            };
        }
        default:
            return state;
    }
}
