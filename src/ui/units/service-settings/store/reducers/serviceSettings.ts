import type {ServiceSettingsActions} from '../actions/serviceSettings';
import {
    RESET_DISPLAYED_USERS,
    SET_SERVICE_USERS_LIST_FAILED,
    SET_SERVICE_USERS_LIST_LOADING,
    SET_SERVICE_USERS_LIST_SUCCESS,
} from '../constants/serviceSettings';
import type {ServiceSettingsState} from '../typings/serviceSettings';

const initialState: ServiceSettingsState = {
    getUsersList: {
        isLoading: false,
        data: null,
        error: null,
    },
    displayedUsers: [],
};

export const serviceSettings = (state = initialState, action: ServiceSettingsActions) => {
    switch (action.type) {
        case SET_SERVICE_USERS_LIST_LOADING: {
            return {
                ...state,
                getUsersList: {
                    ...state.getUsersList,
                    isLoading: true,
                    error: null,
                },
            };
        }
        case SET_SERVICE_USERS_LIST_SUCCESS: {
            return {
                ...state,
                getUsersList: {
                    ...state.getUsersList,
                    isLoading: false,
                    data: action.payload.data,
                },
                displayedUsers: action.payload.isLoadMore
                    ? [...state.displayedUsers, ...action.payload.data.users]
                    : action.payload.data.users,
            };
        }
        case SET_SERVICE_USERS_LIST_FAILED: {
            return {
                ...state,
                getUsersList: {
                    ...state.getUsersList,
                    isLoading: false,
                    error: action.error,
                },
            };
        }
        case RESET_DISPLAYED_USERS: {
            return {
                ...state,
                displayedUsers: [],
            };
        }
        default:
            return state;
    }
};
