import {type ServiceSettingsActions} from '../actions/serviceSettings';
import {
    RESET_SERVICE_USERS_LIST,
    SET_SERVICE_USERS_LIST_FAILED,
    SET_SERVICE_USERS_LIST_LOADING,
    SET_SERVICE_USERS_LIST_SUCCESS,
} from '../constants/serviceSettings';
import type {ServiceSettingsState} from '../typings/serviceSettings';

const initialState: ServiceSettingsState = {
    getUsersList: {
        isLoading: false,
        error: null,
        users: [],
        nextPageToken: null,
    },
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
                    users: action.payload.isLoadMore
                        ? [...state.getUsersList.users, ...action.payload.data.users]
                        : action.payload.data.users,
                    nextPageToken: action.payload.data.nextPageToken,
                },
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
        case RESET_SERVICE_USERS_LIST: {
            return {
                ...state,
                getUsersList: {
                    ...initialState.getUsersList,
                },
            };
        }
        default:
            return state;
    }
};
