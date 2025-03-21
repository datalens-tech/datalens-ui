import {
    RESET_STATE,
    GET_ROOT_COLLECTION_PERMISSIONS_LOADING,
    GET_ROOT_COLLECTION_PERMISSIONS_SUCCESS,
    GET_ROOT_COLLECTION_PERMISSIONS_FAILED,
    RESET_COLLECTION_BREADCRUMBS,
    GET_COLLECTION_BREADCRUMBS_LOADING,
    GET_COLLECTION_BREADCRUMBS_SUCCESS,
    GET_COLLECTION_BREADCRUMBS_FAILED,
    GET_COLLECTION_LOADING,
    GET_COLLECTION_SUCCESS,
    GET_COLLECTION_FAILED,
    RESET_STRUCTURE_ITEMS,
    GET_STRUCTURE_ITEMS_LOADING,
    GET_STRUCTURE_ITEMS_SUCCESS,
    GET_STRUCTURE_ITEMS_FAILED,
    COPY_TEMPLATE_LOADING,
    COPY_TEMPLATE_SUCCESS,
    COPY_TEMPLATE_FAILED,
    CREATE_COLLECTION_LOADING,
    CREATE_COLLECTION_SUCCESS,
    CREATE_COLLECTION_FAILED,
    CREATE_WORKBOOK_LOADING,
    CREATE_WORKBOOK_SUCCESS,
    CREATE_WORKBOOK_FAILED,
    MOVE_COLLECTION_LOADING,
    MOVE_COLLECTION_SUCCESS,
    MOVE_COLLECTION_FAILED,
    MOVE_COLLECTIONS_LOADING,
    MOVE_COLLECTIONS_SUCCESS,
    MOVE_COLLECTIONS_FAILED,
    MOVE_WORKBOOK_LOADING,
    MOVE_WORKBOOK_SUCCESS,
    MOVE_WORKBOOK_FAILED,
    MOVE_WORKBOOKS_LOADING,
    MOVE_WORKBOOKS_SUCCESS,
    MOVE_WORKBOOKS_FAILED,
    COPY_WORKBOOK_LOADING,
    COPY_WORKBOOK_SUCCESS,
    COPY_WORKBOOK_FAILED,
    UPDATE_WORKBOOK_LOADING,
    UPDATE_WORKBOOK_SUCCESS,
    UPDATE_WORKBOOK_FAILED,
    UPDATE_COLLECTION_FAILED,
    UPDATE_COLLECTION_LOADING,
    UPDATE_COLLECTION_SUCCESS,
    DELETE_COLLECTION_FAILED,
    DELETE_COLLECTION_LOADING,
    DELETE_COLLECTION_SUCCESS,
    DELETE_WORKBOOK_FAILED,
    DELETE_WORKBOOK_LOADING,
    DELETE_WORKBOOK_SUCCESS,
    ADD_DEMO_WORKBOOK_LOADING,
    ADD_DEMO_WORKBOOK_SUCCESS,
    ADD_DEMO_WORKBOOK_FAILED,
    DELETE_COLLECTIONS_LOADING,
    DELETE_COLLECTIONS_SUCCESS,
    DELETE_COLLECTIONS_FAILED,
    DELETE_WORKBOOKS_SUCCESS,
    DELETE_WORKBOOKS_LOADING,
    DELETE_WORKBOOKS_FAILED,
    EXPORT_WORKBOOK_LOADING,
    EXPORT_WORKBOOK_SUCCESS,
    EXPORT_WORKBOOK_FAILED,
    IMPORT_WORKBOOK_LOADING,
    IMPORT_WORKBOOK_SUCCESS,
    IMPORT_WORKBOOK_FAILED,
    RESET_EXPORT_WORKBOOK,
    RESET_IMPORT_WORKBOOK,
    GET_IMPORT_PROGRESS_LOADING,
    GET_IMPORT_PROGRESS_SUCCESS,
    RESET_IMPORT_PROGRESS,
    GET_EXPORT_PROGRESS_LOADING,
    GET_EXPORT_PROGRESS_SUCCESS,
    RESET_EXPORT_PROGRESS,
} from '../constants/collectionsStructure';
import type {CollectionsStructureAction} from '../actions/collectionsStructure';
import type {
    GetRootCollectionPermissionsResponse,
    GetCollectionBreadcrumbsResponse,
    GetStructureItemsResponse,
    CollectionWithPermissions,
    Collection,
    Workbook,
    CreateCollectionResponse,
    MoveCollectionResponse,
    MoveCollectionsResponse,
    MoveWorkbookResponse,
    MoveWorkbooksResponse,
    CopyWorkbookResponse,
    CreateWorkbookResponse,
    UpdateWorkbookResponse,
    UpdateCollectionResponse,
    CopyTemplateResponse,
    DeleteCollectionResponse,
    DeleteWorkbooksResponse,
    DeleteWorkbookResponse,
    CopyWorkbookTemplateResponse,
} from '../../../shared/schema';
import type {TempImportExportDataType} from 'ui/components/CollectionsStructure/components/EntriesNotificationCut/types';

export type CollectionsStructureState = {
    getRootCollectionPermissions: {
        isLoading: boolean;
        data: GetRootCollectionPermissionsResponse | null;
        error: Error | null;
    };
    getCollectionBreadcrumbs: {
        isLoading: boolean;
        data: GetCollectionBreadcrumbsResponse | null;
        error: Error | null;
    };
    getCollection: {
        isLoading: boolean;
        data: CollectionWithPermissions | null;
        error: Error | null;
    };
    getStructureItems: {
        isLoading: boolean;
        data: GetStructureItemsResponse | null;
        error: Error | null;
    };
    items: (Collection | Workbook)[];
    createCollection: {
        isLoading: boolean;
        data: CreateCollectionResponse | null;
        error: Error | null;
    };
    copyTemplate: {
        isLoading: boolean;
        data: CopyTemplateResponse | null;
        error: Error | null;
    };
    createWorkbook: {
        isLoading: boolean;
        data: CreateWorkbookResponse | null;
        error: Error | null;
    };
    moveCollection: {
        isLoading: boolean;
        data: MoveCollectionResponse | null;
        error: Error | null;
    };
    moveCollections: {
        isLoading: boolean;
        data: MoveCollectionsResponse | null;
        error: Error | null;
    };
    moveWorkbook: {
        isLoading: boolean;
        data: MoveWorkbookResponse | null;
        error: Error | null;
    };
    moveWorkbooks: {
        isLoading: boolean;
        data: MoveWorkbooksResponse | null;
        error: Error | null;
    };
    copyWorkbook: {
        isLoading: boolean;
        data: CopyWorkbookResponse | null;
        error: Error | null;
    };
    updateWorkbook: {
        isLoading: boolean;
        data: UpdateWorkbookResponse | null;
        error: Error | null;
    };
    updateCollection: {
        isLoading: boolean;
        data: UpdateCollectionResponse | null;
        error: Error | null;
    };
    deleteCollection: {
        isLoading: boolean;
        data: DeleteCollectionResponse | null;
        error: Error | null;
    };
    deleteCollections: {
        isLoading: boolean;
        data: DeleteCollectionResponse | null;
        error: Error | null;
    };
    deleteWorkbook: {
        isLoading: boolean;
        data: DeleteWorkbookResponse | null;
        error: Error | null;
    };
    deleteWorkbooks: {
        isLoading: boolean;
        data: DeleteWorkbooksResponse | null;
        error: Error | null;
    };
    addDemoWorkbook: {
        isLoading: boolean;
        data: CopyWorkbookTemplateResponse | null;
        error: Error | null;
    };
    exportWorkbook: {
        isLoading: boolean;
        data: null | {exportId: string};
        error: Error | null;
    };
    importWorkbook: {
        isLoading: boolean;
        data: null | {importId: string};
        error: Error | null;
    };
    getImportProgress: {
        isLoading: boolean;
        data: null | TempImportExportDataType;
        error: Error | null;
    };
    getExportProgress: {
        isLoading: boolean;
        data: null | TempImportExportDataType;
        error: Error | null;
    };
};

const initialState: CollectionsStructureState = {
    getRootCollectionPermissions: {
        isLoading: false,
        data: null,
        error: null,
    },
    getCollectionBreadcrumbs: {
        isLoading: false,
        data: null,
        error: null,
    },
    getCollection: {
        isLoading: false,
        data: null,
        error: null,
    },
    getStructureItems: {
        isLoading: false,
        data: null,
        error: null,
    },
    items: [],
    createCollection: {
        isLoading: false,
        data: null,
        error: null,
    },
    copyTemplate: {
        isLoading: false,
        data: null,
        error: null,
    },
    createWorkbook: {
        isLoading: false,
        data: null,
        error: null,
    },
    moveCollection: {
        isLoading: false,
        data: null,
        error: null,
    },
    moveCollections: {
        isLoading: false,
        data: null,
        error: null,
    },
    moveWorkbook: {
        isLoading: false,
        data: null,
        error: null,
    },
    moveWorkbooks: {
        isLoading: false,
        data: null,
        error: null,
    },
    copyWorkbook: {
        isLoading: false,
        data: null,
        error: null,
    },
    updateWorkbook: {
        isLoading: false,
        data: null,
        error: null,
    },
    updateCollection: {
        isLoading: false,
        data: null,
        error: null,
    },
    deleteCollection: {
        isLoading: false,
        data: null,
        error: null,
    },
    deleteCollections: {
        isLoading: false,
        data: null,
        error: null,
    },
    deleteWorkbook: {
        isLoading: false,
        data: null,
        error: null,
    },
    deleteWorkbooks: {
        isLoading: false,
        data: null,
        error: null,
    },
    addDemoWorkbook: {
        isLoading: false,
        data: null,
        error: null,
    },
    exportWorkbook: {
        isLoading: false,
        data: null,
        error: null,
    },
    importWorkbook: {
        isLoading: false,
        data: null,
        error: null,
    },
    getImportProgress: {
        isLoading: false,
        data: null,
        error: null,
    },
    getExportProgress: {
        isLoading: false,
        data: null,
        error: null,
    },
};

// eslint-disable-next-line complexity
export const collectionsStructure = (
    state: CollectionsStructureState = initialState,
    action: CollectionsStructureAction,
) => {
    switch (action.type) {
        case RESET_STATE: {
            return initialState;
        }

        // Getting rights at the root of the structure
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

        // Reset the collection bread crumbs
        case RESET_COLLECTION_BREADCRUMBS: {
            return {
                ...state,
                getCollectionBreadcrumbs: initialState.getCollectionBreadcrumbs,
            };
        }

        // Collections Bread Crumbs
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

        // Resetting Collection contents
        case RESET_STRUCTURE_ITEMS: {
            return {
                ...state,
                getStructureItems: initialState.getStructureItems,
                items: initialState.items,
            };
        }

        // Contents of the collection
        case GET_STRUCTURE_ITEMS_LOADING: {
            return {
                ...state,
                getStructureItems: {
                    ...state.getStructureItems,
                    isLoading: true,
                    error: null,
                },
            };
        }
        case GET_STRUCTURE_ITEMS_SUCCESS: {
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
                getStructureItems: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
                items: [...state.items, ...newItems],
            };
        }
        case GET_STRUCTURE_ITEMS_FAILED: {
            return {
                ...state,
                getStructureItems: {
                    ...state.getStructureItems,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        // copy template
        case COPY_TEMPLATE_LOADING: {
            return {
                ...state,
                copyTemplate: {
                    isLoading: true,
                    data: null,
                    error: null,
                },
            };
        }
        case COPY_TEMPLATE_SUCCESS: {
            return {
                ...state,
                copyTemplate: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case COPY_TEMPLATE_FAILED: {
            return {
                ...state,
                copyTemplate: {
                    ...state.copyTemplate,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        // collections creation
        case CREATE_COLLECTION_LOADING: {
            return {
                ...state,
                createCollection: {
                    isLoading: true,
                    data: null,
                    error: null,
                },
            };
        }
        case CREATE_COLLECTION_SUCCESS: {
            return {
                ...state,
                createCollection: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case CREATE_COLLECTION_FAILED: {
            return {
                ...state,
                createCollection: {
                    ...state.createCollection,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        case CREATE_WORKBOOK_LOADING: {
            return {
                ...state,
                createWorkbook: {
                    isLoading: true,
                    data: null,
                    error: null,
                },
            };
        }
        case CREATE_WORKBOOK_SUCCESS: {
            return {
                ...state,
                createWorkbook: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case CREATE_WORKBOOK_FAILED: {
            return {
                ...state,
                createWorkbook: {
                    ...state.createWorkbook,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        // Moving a collection
        case MOVE_COLLECTION_LOADING: {
            return {
                ...state,
                moveCollection: {
                    isLoading: true,
                    data: null,
                    error: null,
                },
            };
        }
        case MOVE_COLLECTION_SUCCESS: {
            return {
                ...state,
                moveCollection: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case MOVE_COLLECTION_FAILED: {
            return {
                ...state,
                moveCollection: {
                    ...state.moveCollection,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        // Moving collections
        case MOVE_COLLECTIONS_LOADING: {
            return {
                ...state,
                moveCollections: {
                    isLoading: true,
                    data: null,
                    error: null,
                },
            };
        }
        case MOVE_COLLECTIONS_SUCCESS: {
            return {
                ...state,
                moveCollections: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case MOVE_COLLECTIONS_FAILED: {
            return {
                ...state,
                moveCollections: {
                    ...state.moveCollections,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        // Moving the workbook
        case MOVE_WORKBOOK_LOADING: {
            return {
                ...state,
                moveWorkbook: {
                    isLoading: true,
                    data: null,
                    error: null,
                },
            };
        }
        case MOVE_WORKBOOK_SUCCESS: {
            return {
                ...state,
                moveWorkbook: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case MOVE_WORKBOOK_FAILED: {
            return {
                ...state,
                moveWorkbook: {
                    ...state.moveWorkbook,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        // Moving workbooks
        case MOVE_WORKBOOKS_LOADING: {
            return {
                ...state,
                moveWorkbooks: {
                    isLoading: true,
                    data: null,
                    error: null,
                },
            };
        }
        case MOVE_WORKBOOKS_SUCCESS: {
            return {
                ...state,
                moveWorkbooks: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case MOVE_WORKBOOKS_FAILED: {
            return {
                ...state,
                moveWorkbooks: {
                    ...state.moveWorkbooks,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        // Copying a workbook
        case COPY_WORKBOOK_LOADING: {
            return {
                ...state,
                copyWorkbook: {
                    isLoading: true,
                    data: null,
                    error: null,
                },
            };
        }
        case COPY_WORKBOOK_SUCCESS: {
            return {
                ...state,
                copyWorkbook: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case COPY_WORKBOOK_FAILED: {
            return {
                ...state,
                copyWorkbook: {
                    ...state.copyWorkbook,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        // Workbook modification
        case UPDATE_WORKBOOK_LOADING: {
            return {
                ...state,
                updateWorkbook: {
                    isLoading: true,
                    data: null,
                    error: null,
                },
            };
        }
        case UPDATE_WORKBOOK_SUCCESS: {
            return {
                ...state,
                updateWorkbook: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case UPDATE_WORKBOOK_FAILED: {
            return {
                ...state,
                updateWorkbook: {
                    ...state.updateWorkbook,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        // Collection modification
        case UPDATE_COLLECTION_LOADING: {
            return {
                ...state,
                updateCollection: {
                    isLoading: true,
                    data: null,
                    error: null,
                },
            };
        }
        case UPDATE_COLLECTION_SUCCESS: {
            return {
                ...state,
                updateCollection: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case UPDATE_COLLECTION_FAILED: {
            return {
                ...state,
                updateCollection: {
                    ...state.updateCollection,
                    isLoading: false,
                    error: action.error,
                },
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

        // Delete collections
        case DELETE_COLLECTIONS_LOADING: {
            return {
                ...state,
                deleteCollections: {
                    isLoading: true,
                    data: null,
                    error: null,
                },
            };
        }
        case DELETE_COLLECTIONS_SUCCESS: {
            return {
                ...state,
                deleteCollections: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case DELETE_COLLECTIONS_FAILED: {
            return {
                ...state,
                deleteCollections: {
                    ...state.deleteCollections,
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

        // Delete workbooks
        case DELETE_WORKBOOKS_LOADING: {
            return {
                ...state,
                deleteWorkbooks: {
                    isLoading: true,
                    data: null,
                    error: null,
                },
            };
        }
        case DELETE_WORKBOOKS_SUCCESS: {
            return {
                ...state,
                deleteWorkbooks: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case DELETE_WORKBOOKS_FAILED: {
            return {
                ...state,
                deleteWorkbooks: {
                    ...state.deleteWorkbooks,
                    isLoading: false,
                    error: action.error,
                },
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

        // Export workbook file
        case EXPORT_WORKBOOK_LOADING: {
            return {
                ...state,
                exportWorkbook: {
                    isLoading: true,
                    data: null,
                    error: null,
                },
            };
        }
        case EXPORT_WORKBOOK_SUCCESS: {
            return {
                ...state,
                exportWorkbook: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case EXPORT_WORKBOOK_FAILED: {
            return {
                ...state,
                exportWorkbook: {
                    isLoading: false,
                    data: null,
                    error: action.error,
                },
            };
        }
        case RESET_EXPORT_WORKBOOK: {
            return {
                ...state,
                exportWorkbook: {
                    isLoading: false,
                    data: null,
                    error: null,
                },
            };
        }

        // Import workbook file
        case IMPORT_WORKBOOK_LOADING: {
            return {
                ...state,
                importWorkbook: {
                    isLoading: true,
                    data: null,
                    error: null,
                },
            };
        }
        case IMPORT_WORKBOOK_SUCCESS: {
            return {
                ...state,
                importWorkbook: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case IMPORT_WORKBOOK_FAILED: {
            return {
                ...state,
                importWorkbook: {
                    isLoading: false,
                    data: null,
                    error: action.error,
                },
            };
        }
        case RESET_IMPORT_WORKBOOK: {
            return {
                ...state,
                importWorkbook: {
                    isLoading: false,
                    data: null,
                    error: null,
                },
            };
        }

        // Getting workbook import progres
        case GET_IMPORT_PROGRESS_LOADING: {
            return {
                ...state,
                getImportProgress: {
                    data: null,
                    isLoading: true,
                    error: null,
                },
            };
        }
        case GET_IMPORT_PROGRESS_SUCCESS: {
            return {
                ...state,
                getImportProgress: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case RESET_IMPORT_PROGRESS: {
            return {
                ...state,
                getImportProgress: {
                    isLoading: false,
                    data: null,
                    error: null,
                },
            };
        }

        // Getting workbook export progress
        case GET_EXPORT_PROGRESS_LOADING: {
            return {
                ...state,
                getExportProgress: {
                    data: null,
                    isLoading: true,
                    error: null,
                },
            };
        }
        case GET_EXPORT_PROGRESS_SUCCESS: {
            return {
                ...state,
                getExportProgress: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case RESET_EXPORT_PROGRESS: {
            return {
                ...state,
                getExportProgress: {
                    isLoading: false,
                    data: null,
                    error: null,
                },
            };
        }

        default: {
            return state;
        }
    }
};
