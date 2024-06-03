import type {GetCollectionBreadcrumbsResponse} from '../../../../../shared/schema';
import type {CollectionsNavigationAction} from '../actions';
import {
    GET_COLLECTION_BREADCRUMBS_FAILED,
    GET_COLLECTION_BREADCRUMBS_LOADING,
    GET_COLLECTION_BREADCRUMBS_SUCCESS,
    RESET_STATE,
    SET_COLLECTION_BREDCRUMBS,
} from '../constants';

export type CollectionsNavigationState = {
    getCollectionBreadcrumbs: {
        isLoading: boolean;
        data: GetCollectionBreadcrumbsResponse | null;
        error: Error | null;
    };
};

const initialState: CollectionsNavigationState = {
    getCollectionBreadcrumbs: {
        isLoading: false,
        data: null,
        error: null,
    },
};

export const collectionsNavigationReducer = (
    state: CollectionsNavigationState = initialState,
    action: CollectionsNavigationAction,
) => {
    switch (action.type) {
        case RESET_STATE: {
            return {
                ...initialState,
            };
        }

        case GET_COLLECTION_BREADCRUMBS_LOADING: {
            return {
                ...state,
                getCollectionBreadcrumbs: {
                    ...state.getCollectionBreadcrumbs,
                    isLoading: true,
                    error: null,
                },
            };
        }
        case GET_COLLECTION_BREADCRUMBS_SUCCESS: {
            return {
                ...state,
                getCollectionBreadcrumbs: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case GET_COLLECTION_BREADCRUMBS_FAILED: {
            return {
                ...state,
                getCollectionBreadcrumbs: {
                    ...state.getCollectionBreadcrumbs,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        case SET_COLLECTION_BREDCRUMBS: {
            return {
                ...state,
                getCollectionBreadcrumbs: {
                    isLoading: false,
                    data: action.data.collectionBreadcrumbs,
                    error: null,
                },
            };
        }

        default: {
            return state;
        }
    }
};
