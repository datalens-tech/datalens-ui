import type {UserProfile} from 'shared/schema/auth/types/users';

import type {UserProfileAction} from '../actions/userProfile';
import {
    DELETE_USER_PROFILE_FAILED,
    DELETE_USER_PROFILE_LOADING,
    DELETE_USER_PROFILE_SUCCESS,
    GET_USER_PROFILE_FAILED,
    GET_USER_PROFILE_LOADING,
    GET_USER_PROFILE_SUCCESS,
    RESET_USER_PROFILE_STATE,
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

        default: {
            return state;
        }
    }
};
