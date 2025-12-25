import {type ServiceSettingsActions} from '../actions/serviceSettings';
import {
    RESET_CREATE_USER,
    RESET_SERVICE_USERS_LIST,
    RESTORE_USERS_STATE_AFTER_FILTER,
    SAVE_USERS_STATE_BEFORE_FILTER,
    SET_CREATE_USER_FAILED,
    SET_CREATE_USER_LOADING,
    SET_CREATE_USER_SUCCESS,
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
        loadedBeforeFilter: null,
        nextPageTokenBeforeFilter: null,
    },
    createUser: {
        isLoading: false,
        error: null,
        data: null,
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
        case SET_CREATE_USER_LOADING: {
            return {
                ...state,
                createUser: {
                    ...state.createUser,
                    isLoading: true,
                    error: null,
                },
            };
        }
        case SET_CREATE_USER_SUCCESS: {
            return {
                ...state,
                createUser: {
                    ...state.createUser,
                    isLoading: false,
                    data: action.payload,
                },
            };
        }
        case SET_CREATE_USER_FAILED: {
            return {
                ...state,
                createUser: {
                    ...state.createUser,
                    isLoading: false,
                    error: action.error,
                },
            };
        }
        case RESET_CREATE_USER: {
            return {
                ...state,
                createUser: {
                    ...initialState.createUser,
                },
            };
        }
        case SAVE_USERS_STATE_BEFORE_FILTER: {
            return {
                ...state,
                getUsersList: {
                    ...state.getUsersList,
                    loadedBeforeFilter: [...state.getUsersList.users],
                    nextPageTokenBeforeFilter: state.getUsersList.nextPageToken,
                },
            };
        }
        case RESTORE_USERS_STATE_AFTER_FILTER: {
            if (state.getUsersList.loadedBeforeFilter) {
                return {
                    ...state,
                    getUsersList: {
                        ...state.getUsersList,
                        users: state.getUsersList.loadedBeforeFilter,
                        nextPageToken: state.getUsersList.nextPageTokenBeforeFilter,
                        loadedBeforeFilter: null,
                        nextPageTokenBeforeFilter: null,
                    },
                };
            }
            return state;
        }
        default:
            return state;
    }
};
