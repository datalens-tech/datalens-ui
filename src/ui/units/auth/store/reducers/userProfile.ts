import type {UserProfile} from 'shared/schema/auth/types/users';

import type {UserProfileAction} from '../actions/userProfile';
import {
    DELETE_USER_PROFILE_FAILED,
    DELETE_USER_PROFILE_LOADING,
    DELETE_USER_PROFILE_SUCCESS,
    GET_USER_PROFILE_FAILED,
    GET_USER_PROFILE_LOADING,
    GET_USER_PROFILE_SUCCESS,
    RESET_UPDATE_USER_PASSWORD_STATE,
    RESET_USER_PROFILE_STATE,
    UPDATE_USER_PASSWORD_FAILED,
    UPDATE_USER_PASSWORD_LOADING,
    UPDATE_USER_PASSWORD_SUCCESS,
} from '../constants/userProfile';

interface UserProfileState {
    getProfile: {
        isLoading: boolean;
        data: {profile: UserProfile} | null;
        error: Error | null;
    };
    deleteProfile: {
        isLoading: boolean;
        error: Error | null;
    };
    updatePassword: {
        isLoading: false;
        error: Error | null;
    };
}

const initialState: UserProfileState = {
    getProfile: {
        isLoading: false,
        data: null,
        error: null,
    },
    deleteProfile: {
        isLoading: false,
        error: null,
    },
    updatePassword: {
        isLoading: false,
        error: null,
    },
};

export const userProfileReducer = (
    state: UserProfileState = initialState,
    action: UserProfileAction,
) => {
    switch (action.type) {
        case GET_USER_PROFILE_LOADING: {
            return {
                ...state,
                getProfile: {
                    ...state.getProfile,
                    isLoading: true,
                    error: null,
                },
            };
        }
        case GET_USER_PROFILE_SUCCESS: {
            return {
                ...state,
                getProfile: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case GET_USER_PROFILE_FAILED: {
            return {
                ...state,
                getProfile: {
                    ...state.getProfile,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        case RESET_USER_PROFILE_STATE: {
            return {
                ...state,
                getProfile: {
                    ...initialState.getProfile,
                },
            };
        }

        case DELETE_USER_PROFILE_LOADING: {
            return {
                ...state,
                deleteProfile: {
                    ...state.deleteProfile,
                    isLoading: true,
                    error: null,
                },
            };
        }
        case DELETE_USER_PROFILE_SUCCESS: {
            return {
                ...state,
                deleteProfile: {
                    ...state.deleteProfile,
                    isLoading: false,
                    error: null,
                },
            };
        }
        case DELETE_USER_PROFILE_FAILED: {
            return {
                ...state,
                deleteProfile: {
                    ...state.deleteProfile,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        case UPDATE_USER_PASSWORD_LOADING: {
            return {
                ...state,
                updatePassword: {
                    ...state.updatePassword,
                    isLoading: true,
                    error: null,
                },
            };
        }
        case UPDATE_USER_PASSWORD_SUCCESS: {
            return {
                ...state,
                updatePassword: {
                    ...state.updatePassword,
                    isLoading: false,
                    error: null,
                },
            };
        }
        case UPDATE_USER_PASSWORD_FAILED: {
            return {
                ...state,
                updatePassword: {
                    ...state.updatePassword,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        case RESET_UPDATE_USER_PASSWORD_STATE: {
            return {
                ...state,
                updatePassword: {...initialState.updatePassword},
            };
        }

        default: {
            return state;
        }
    }
};
