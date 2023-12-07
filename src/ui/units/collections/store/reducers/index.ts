import type {
    CollectionWithPermissions,
    CopyWorkbookTemplateResponse,
    DeleteCollectionResponse,
    DeleteWorkbookResponse,
    GetCollectionBreadcrumbsResponse,
    GetCollectionContentResponse,
    GetRootCollectionPermissionsResponse,
    WorkbookWithPermissions,
} from '../../../../../shared/schema';
import {CollectionsAction} from '../actions';
import {
    ADD_DEMO_WORKBOOK_FAILED,
    ADD_DEMO_WORKBOOK_LOADING,
    ADD_DEMO_WORKBOOK_SUCCESS,
    DELETE_COLLECTION_FAILED,
    DELETE_COLLECTION_IN_ITEMS,
    DELETE_COLLECTION_LOADING,
    DELETE_COLLECTION_SUCCESS,
    DELETE_WORKBOOK_FAILED,
    DELETE_WORKBOOK_IN_ITEMS,
    DELETE_WORKBOOK_LOADING,
    DELETE_WORKBOOK_SUCCESS,
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
    deleteCollection: {
        isLoading: boolean;
        data: DeleteCollectionResponse | null;
        error: Error | null;
    };
    addDemoWorkbook: {
        isLoading: boolean;
        data: CopyWorkbookTemplateResponse | null;
        error: Error | null;
    };
    deleteWorkbook: {
        isLoading: boolean;
        data: DeleteWorkbookResponse | null;
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
    deleteCollection: {
        isLoading: false,
        data: null,
        error: null,
    },
    addDemoWorkbook: {
        isLoading: false,
        data: null,
        error: null,
    },
    deleteWorkbook: {
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
                getCollectionContent: {
                    ...state.getCollection,
                    isLoading: false,
                    error: action.error,
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

        // Deleting a collection
        case DELETE_COLLECTION_LOADING: {
            return {
                ...state,
                deleteCollection: {
                    isLoading: true,
                    data: null,
                    error: null,
                },
            };
        }
        case DELETE_COLLECTION_SUCCESS: {
            return {
                ...state,
                deleteCollection: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case DELETE_COLLECTION_FAILED: {
            return {
                ...state,
                deleteCollection: {
                    ...state.deleteCollection,
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

        // Adding a demo workbook
        case ADD_DEMO_WORKBOOK_LOADING: {
            return {
                ...state,
                addDemoWorkbook: {
                    isLoading: true,
                    data: null,
                    error: null,
                },
            };
        }
        case ADD_DEMO_WORKBOOK_SUCCESS: {
            return {
                ...state,
                addDemoWorkbook: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case ADD_DEMO_WORKBOOK_FAILED: {
            return {
                ...state,
                addDemoWorkbook: {
                    ...state.addDemoWorkbook,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        // Deleting a workbook
        case DELETE_WORKBOOK_LOADING: {
            return {
                ...state,
                deleteWorkbook: {
                    isLoading: true,
                    data: null,
                    error: null,
                },
            };
        }
        case DELETE_WORKBOOK_SUCCESS: {
            return {
                ...state,
                deleteWorkbook: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case DELETE_WORKBOOK_FAILED: {
            return {
                ...state,
                deleteWorkbook: {
                    ...state.deleteWorkbook,
                    isLoading: false,
                    error: action.error,
                },
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
