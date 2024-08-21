import type {
    CollectionWithOptionalPermissions,
    CollectionWithPermissions,
    GetCollectionContentResponse,
    GetRootCollectionPermissionsResponse,
    WorkbookWithPermissions,
} from '../../../../../shared/schema';
import type {CollectionsAction} from '../actions';
import {
    DELETE_COLLECTION_IN_ITEMS,
    DELETE_WORKBOOK_IN_ITEMS,
    GET_COLLECTION_CONTENT_FAILED,
    GET_COLLECTION_CONTENT_LOADING,
    GET_COLLECTION_CONTENT_SUCCESS,
    GET_COLLECTION_FAILED,
    GET_COLLECTION_LOADING,
    GET_COLLECTION_SUCCESS,
    GET_ROOT_COLLECTION_PERMISSIONS_FAILED,
    GET_ROOT_COLLECTION_PERMISSIONS_LOADING,
    GET_ROOT_COLLECTION_PERMISSIONS_SUCCESS,
    RESET_COLLECTION,
    RESET_COLLECTION_CONTENT,
    RESET_STATE,
    SET_COLLECTION,
} from '../constants';

export type CollectionsState = {
    getCollection: {
        isLoading: boolean;
        data: CollectionWithOptionalPermissions | null;
        error: Error | null;
    };
    getCollectionContent: {
        isLoading: boolean;
        data: GetCollectionContentResponse | null;
        error: Error | null;
    };
    items: (CollectionWithPermissions | WorkbookWithPermissions)[];
    getRootCollectionPermissions: {
        isLoading: boolean;
        data: GetRootCollectionPermissionsResponse | null;
        error: Error | null;
    };
};

const initialState: CollectionsState = {
    getCollection: {
        isLoading: false,
        data: null,
        error: null,
    },
    getCollectionContent: {
        isLoading: false,
        data: null,
        error: null,
    },
    items: [],
    getRootCollectionPermissions: {
        isLoading: false,
        data: null,
        error: null,
    },
};

// eslint-disable-next-line complexity
export const collectionsReducer = (
    state: CollectionsState = initialState,
    action: CollectionsAction,
) => {
    switch (action.type) {
        case RESET_STATE: {
            return {
                ...initialState,
            };
        }

        case GET_COLLECTION_LOADING: {
            return {
                ...state,
                getCollection: {
                    ...state.getCollection,
                    isLoading: true,
                    error: null,
                },
            };
        }
        case GET_COLLECTION_SUCCESS: {
            return {
                ...state,
                getCollection: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case GET_COLLECTION_FAILED: {
            return {
                ...state,
                getCollection: {
                    ...state.getCollection,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        case SET_COLLECTION: {
            return {
                ...state,
                getCollection: {
                    isLoading: false,
                    data: action.data.collection,
                    error: null,
                },
            };
        }
        case RESET_COLLECTION: {
            return {
                ...state,
                getCollection: initialState.getCollection,
            };
        }

        case GET_COLLECTION_CONTENT_LOADING: {
            return {
                ...state,
                getCollectionContent: {
                    ...state.getCollectionContent,
                    isLoading: true,
                    error: null,
                },
            };
        }
        case GET_COLLECTION_CONTENT_SUCCESS: {
            const loadedIds = state.items.map((item) => {
                if ('workbookId' in item) {
                    return item.workbookId;
                }
                return item.collectionId;
            });

            const newItems = action.data.items.filter((item) => {
                const id = 'workbookId' in item ? item.workbookId : item.collectionId;
                return !loadedIds.includes(id);
            });

            return {
                ...state,
                getCollectionContent: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
                items: [...state.items, ...newItems],
            };
        }
        case GET_COLLECTION_CONTENT_FAILED: {
            return {
                ...state,
                getCollectionContent: {
                    ...state.getCollectionContent,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        case RESET_COLLECTION_CONTENT: {
            return {
                ...state,
                getCollectionContent: initialState.getCollectionContent,
                items: initialState.items,
            };
        }

        case GET_ROOT_COLLECTION_PERMISSIONS_LOADING: {
            return {
                ...state,
                getRootCollectionPermissions: {
                    ...state.getRootCollectionPermissions,
                    isLoading: true,
                    error: null,
                },
            };
        }
        case GET_ROOT_COLLECTION_PERMISSIONS_SUCCESS: {
            return {
                ...state,
                getRootCollectionPermissions: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case GET_ROOT_COLLECTION_PERMISSIONS_FAILED: {
            return {
                ...state,
                getRootCollectionPermissions: {
                    ...state.getRootCollectionPermissions,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        case DELETE_COLLECTION_IN_ITEMS: {
            return {
                ...state,
                items: state.items.filter((item) => {
                    if (!('workbookId' in item) && action.data.collectionId === item.collectionId) {
                        return false;
                    }
                    return true;
                }),
            };
        }
        case DELETE_WORKBOOK_IN_ITEMS: {
            return {
                ...state,
                items: state.items.filter((item) => {
                    if ('workbookId' in item && action.data.workbookId === item.workbookId) {
                        return false;
                    }
                    return true;
                }),
            };
        }

        default: {
            return state;
        }
    }
};
