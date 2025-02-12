import type {UserProfile} from 'shared/schema/auth/types/users';

import type {UserProfileAction} from '../actions/userProfile';
import {
    GET_USER_PROFILE_FAILED,
    GET_USER_PROFILE_LOADING,
    GET_USER_PROFILE_SUCCESS,
    RESET_USER_PROFILE_STATE,
} from '../constants/userProfile';

interface UserProfileState {
    profile: {
        isLoading: boolean;
        data: {profile: UserProfile} | null;
        error: Error | null;
    };
}

const initialState: UserProfileState = {
    profile: {
        isLoading: false,
        data: null,
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
                isLoading: true,
                error: null,
            };
        }
        case GET_USER_PROFILE_SUCCESS: {
            return {
                ...state,
                profile: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case GET_USER_PROFILE_FAILED: {
            return {
                ...state,
                profile: {
                    ...state.profile,
                    isLoading: false,
                    error: action.error,
                },
            };
        }
        case RESET_USER_PROFILE_STATE: {
            return {
                ...state,
                profile: {
                    ...initialState.profile,
                },
            };
        }
        default: {
            return state;
        }
    }
};
