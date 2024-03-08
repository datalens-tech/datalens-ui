import type {
    CollectionWithPermissions,
    GetCollectionBreadcrumbsResponse,
    GetCollectionContentResponse,
    GetRootCollectionPermissionsResponse,
    WorkbookWithPermissions,
} from '../../../../../shared/schema';
import {CollectionsAction} from '../actions';
import {
    DELETE_COLLECTION_IN_ITEMS,
    DELETE_WORKBOOK_IN_ITEMS,
    GET_COLLECTION_BREADCRUMBS_FAILED,
    GET_COLLECTION_BREADCRUMBS_LOADING,
    GET_COLLECTION_BREADCRUMBS_SUCCESS,
    GET_COLLECTION_CONTENT_FAILED,
    GET_COLLECTION_CONTENT_LOADING,
    GET_COLLECTION_CONTENT_SUCCESS,
    GET_COLLECTION_FAILED,
    GET_COLLECTION_LOADING,
    GET_COLLECTION_SUCCESS,
    GET_ROOT_COLLECTION_PERMISSIONS_FAILED,
    GET_ROOT_COLLECTION_PERMISSIONS_LOADING,
    GET_ROOT_COLLECTION_PERMISSIONS_SUCCESS,
    RESET_COLLECTION_CONTENT,
    RESET_COLLECTION_INFO,
    SET_COLLECTION,
    SET_COLLECTION_BREDCRUMBS,
} from '../constants';

export type CollectionsState = {
    getRootCollectionPermissions: {
        isLoading: boolean;
        data: GetRootCollectionPermissionsResponse | null;
        error: Error | null;
    };
    getCollectionContent: {
        isLoading: boolean;
        data: GetCollectionContentResponse | null;
        error: Error | null;
    };
    items: (CollectionWithPermissions | WorkbookWithPermissions)[];
    getCollection: {
        isLoading: boolean;
        data: CollectionWithPermissions | null;
        error: Error | null;
    };
    getCollectionBreadcrumbs: {
        isLoading: boolean;
        data: GetCollectionBreadcrumbsResponse | null;
        error: Error | null;
    };
};

const initialState: CollectionsState = {
    getRootCollectionPermissions: {
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
    getCollection: {
        isLoading: false,
        data: null,
        error: null,
    },
    getCollectionBreadcrumbs: {
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
        // Getting the rights to create collections/workbooks in the root
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

        // The start page of the collection content
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

            const newCollections = action.data.collections.filter(
                (collection) => !loadedIds.includes(collection.collectionId),
            );
            const newWorkbooks = action.data.workbooks.filter(
                (workbook) => !loadedIds.includes(workbook.workbookId),
            );

            return {
                ...state,
                getCollectionContent: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
                items: [...state.items, ...newCollections, ...newWorkbooks],
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

        // Information about the collection
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

        // Bread Crumbs collections
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

        // Resetting Collection information
        case RESET_COLLECTION_INFO: {
            return {
                ...state,
                getCollection: initialState.getCollection,
                getCollectionBreadcrumbs: initialState.getCollectionBreadcrumbs,
            };
        }

        // Resetting information about the contents of the collection
        case RESET_COLLECTION_CONTENT: {
            return {
                ...state,
                getCollectionContent: initialState.getCollectionContent,
                items: initialState.items,
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
