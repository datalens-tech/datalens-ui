import type {
    AddFavoriteResponse,
    DeleteEntryResponse,
    DeleteFavoriteResponse,
    EntryFields,
    GetCollectionBreadcrumbsResponse,
    GetEntryResponse,
    GetWorkbookEntriesResponse,
    RenameEntryResponse,
    WorkbookPermission,
    WorkbookWithPermissions,
} from 'shared/schema';

import type {CreateEntryActionType} from '../../constants';
import type {WorkbookEntriesFilters} from '../../types';
import type {WorkbooksAction} from '../actions';
import {
    ADD_WORKBOOK_INFO,
    BIND_SHARED_ENTRY_TO_WORKBOOK_FAILED,
    BIND_SHARED_ENTRY_TO_WORKBOOK_LOADING,
    BIND_SHARED_ENTRY_TO_WORKBOOK_SUCCESS,
    CHANGE_FAVORITE_ENTRY_FAILED,
    CHANGE_FAVORITE_ENTRY_INLINE,
    CHANGE_FAVORITE_ENTRY_LOADING,
    CHANGE_FAVORITE_ENTRY_SUCCESS,
    CHANGE_FILTERS,
    DELETE_ENTRY_FAILED,
    DELETE_ENTRY_INLINE,
    DELETE_ENTRY_LOADING,
    DELETE_ENTRY_SUCCESS,
    GET_ALL_WORKBOOK_ENTRIES_SEPARATELY_SUCCESS,
    GET_WORKBOOK_BREADCRUMBS_FAILED,
    GET_WORKBOOK_BREADCRUMBS_LOADING,
    GET_WORKBOOK_BREADCRUMBS_SUCCESS,
    GET_WORKBOOK_ENTRIES_FAILED,
    GET_WORKBOOK_ENTRIES_LOADING,
    GET_WORKBOOK_ENTRIES_SUCCESS,
    GET_WORKBOOK_FAILED,
    GET_WORKBOOK_LOADING,
    GET_WORKBOOK_SHARED_ENTRIES_FAILED,
    GET_WORKBOOK_SHARED_ENTRIES_LOADING,
    GET_WORKBOOK_SHARED_ENTRIES_SUCCESS,
    GET_WORKBOOK_SUCCESS,
    RENAME_ENTRY_FAILED,
    RENAME_ENTRY_INLINE,
    RENAME_ENTRY_LOADING,
    RENAME_ENTRY_SUCCESS,
    RESET_CREATE_WORKBOOK_ENTRY_TYPE,
    RESET_WORKBOOK_ENTRIES,
    RESET_WORKBOOK_ENTRIES_BY_SCOPE,
    RESET_WORKBOOK_PERMISSIONS,
    RESET_WORKBOOK_SHARED_ENTRIES,
    SET_CREATE_WORKBOOK_ENTRY_TYPE,
    SET_WORKBOOK,
} from '../constants';

export type WorkbooksState = {
    getWorkbookEntries: {
        isLoading: boolean;
        data: GetWorkbookEntriesResponse | null;
        error: Error | null;
    };
    getWorkbookSharedEntries: {
        isLoading: boolean;
        data: GetWorkbookEntriesResponse | null;
        error: Error | null;
    };
    bindSharedEntryToWorkbook: {
        isLoading: boolean;
        error: Error | null;
    };
    sharedItems: GetWorkbookEntriesResponse['entries'];
    items: GetWorkbookEntriesResponse['entries'];
    getWorkbook: {
        isLoading: boolean;
        data: WorkbookWithPermissions | null;
        error: Error | null;
    };
    getWorkbookBreadcrumbs: {
        isLoading: boolean;
        data: GetCollectionBreadcrumbsResponse | null;
        error: Error | null;
    };
    createWorkbookEntry: {
        type: CreateEntryActionType | null;
    };
    renameEntry: {
        isLoading: boolean;
        data: RenameEntryResponse | null;
        error: Error | null;
    };
    changeFavoriteEntry: {
        isLoading: boolean;
        data: AddFavoriteResponse | DeleteFavoriteResponse | null;
        error: Error | null;
    };
    deleteEntry: {
        isLoading: boolean;
        data: DeleteEntryResponse | null;
        error: Error | null;
    };
    filters: WorkbookEntriesFilters;
    workbooksNames: Record<string, string>;
    workbookPermissions: WorkbookPermission | null;
    workbookBreadcrumbs: GetCollectionBreadcrumbsResponse | null;
};

const initialState: WorkbooksState = {
    getWorkbookEntries: {
        isLoading: false,
        data: null,
        error: null,
    },
    getWorkbookSharedEntries: {
        isLoading: false,
        data: null,
        error: null,
    },
    bindSharedEntryToWorkbook: {
        isLoading: false,
        error: null,
    },
    items: [],
    sharedItems: [],
    getWorkbook: {
        isLoading: false,
        data: null,
        error: null,
    },
    getWorkbookBreadcrumbs: {
        isLoading: false,
        data: null,
        error: null,
    },
    createWorkbookEntry: {
        type: null,
    },
    renameEntry: {
        isLoading: false,
        data: null,
        error: null,
    },
    changeFavoriteEntry: {
        isLoading: false,
        data: null,
        error: null,
    },
    deleteEntry: {
        isLoading: false,
        data: null,
        error: null,
    },
    filters: {
        filterString: undefined,
        orderField: 'name',
        orderDirection: 'asc',
    },
    workbooksNames: {},
    workbookPermissions: null,
    workbookBreadcrumbs: null,
};

// eslint-disable-next-line complexity
export const workbooksReducer = (state: WorkbooksState = initialState, action: WorkbooksAction) => {
    switch (action.type) {
        // Information about the workbook
        case GET_WORKBOOK_LOADING: {
            return {
                ...state,
                getWorkbook: {
                    ...state.getWorkbook,
                    isLoading: true,
                    error: null,
                },
            };
        }
        case GET_WORKBOOK_SUCCESS: {
            return {
                ...state,
                getWorkbook: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case GET_WORKBOOK_FAILED: {
            return {
                ...state,
                getWorkbook: {
                    ...state.getWorkbook,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        // Bread crumbs of workbooks
        case GET_WORKBOOK_BREADCRUMBS_LOADING: {
            return {
                ...state,
                getWorkbookBreadcrumbs: {
                    ...state.getWorkbookBreadcrumbs,
                    isLoading: true,
                    error: null,
                },
            };
        }
        case GET_WORKBOOK_BREADCRUMBS_SUCCESS: {
            return {
                ...state,
                getWorkbookBreadcrumbs: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case GET_WORKBOOK_BREADCRUMBS_FAILED: {
            return {
                ...state,
                getWorkbookBreadcrumbs: {
                    ...state.getWorkbookBreadcrumbs,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        // Entities in the workbook
        case GET_WORKBOOK_ENTRIES_LOADING: {
            return {
                ...state,
                getWorkbookEntries: {
                    ...state.getWorkbookEntries,
                    isLoading: true,
                    error: null,
                },
            };
        }
        case GET_WORKBOOK_ENTRIES_SUCCESS: {
            const loadedIds = new Set(
                state.items.map((item) => {
                    return item.entryId;
                }),
            );

            const newEntries = action.data.entries.filter((entry) => !loadedIds.has(entry.entryId));

            return {
                ...state,
                getWorkbookEntries: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
                items: [...state.items, ...newEntries],
            };
        }

        case GET_ALL_WORKBOOK_ENTRIES_SEPARATELY_SUCCESS: {
            const loadedIds = new Set(
                state.items.map((item) => {
                    return item.entryId;
                }),
            );

            const newEntries: GetEntryResponse[] = [];

            action.data.forEach((workbookEntries) => {
                return workbookEntries?.entries.forEach((entry) => {
                    if (!loadedIds.has(entry.entryId)) {
                        newEntries.push(entry);
                    }
                });
            });

            return {
                ...state,
                getWorkbookEntries: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
                items: [...state.items, ...newEntries],
            };
        }

        case GET_WORKBOOK_ENTRIES_FAILED: {
            return {
                ...state,
                getWorkbookEntries: {
                    ...state.getWorkbookEntries,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        // Shared entities in the workbook
        case GET_WORKBOOK_SHARED_ENTRIES_LOADING: {
            return {
                ...state,
                getWorkbookSharedEntries: {
                    ...state.getWorkbookSharedEntries,
                    isLoading: true,
                    error: null,
                },
            };
        }
        case GET_WORKBOOK_SHARED_ENTRIES_SUCCESS: {
            const loadedIds = new Set(
                state.sharedItems.map((item) => {
                    return item.entryId;
                }),
            );

            const newEntries = action.data.entries.filter((entry) => !loadedIds.has(entry.entryId));

            return {
                ...state,
                getWorkbookSharedEntries: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
                sharedItems: [...state.sharedItems, ...newEntries],
            };
        }

        case GET_WORKBOOK_SHARED_ENTRIES_FAILED: {
            return {
                ...state,
                getWorkbookSharedEntries: {
                    ...state.getWorkbookSharedEntries,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        case BIND_SHARED_ENTRY_TO_WORKBOOK_LOADING: {
            return {
                ...state,
                bindSharedEntryToWorkbook: {
                    ...state.bindSharedEntryToWorkbook,
                    isLoading: true,
                },
            };
        }

        case BIND_SHARED_ENTRY_TO_WORKBOOK_SUCCESS: {
            return {
                ...state,
                bindSharedEntryToWorkbook: {
                    isLoading: false,
                    error: null,
                },
            };
        }

        case BIND_SHARED_ENTRY_TO_WORKBOOK_FAILED: {
            return {
                ...state,
                bindSharedEntryToWorkbook: {
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        // Resetting information about the contents of the workbook
        case RESET_WORKBOOK_ENTRIES: {
            return {
                ...state,
                getWorkbookEntries: initialState.getWorkbookEntries,
                items: initialState.items,
            };
        }

        // Resetting information about the shared entries of the workbook
        case RESET_WORKBOOK_SHARED_ENTRIES: {
            return {
                ...state,
                getWorkbookSharedEntries: initialState.getWorkbookSharedEntries,
                sharedItems: initialState.sharedItems,
            };
        }

        case RESET_WORKBOOK_ENTRIES_BY_SCOPE: {
            const entries = state.items.filter((entry) => entry.scope !== action.data);

            return {
                ...state,
                getWorkbookEntries: {
                    ...state.getWorkbookEntries,
                    data: entries,
                },
                items: entries,
            };
        }

        // Information about which entity to create in the workbook
        case SET_CREATE_WORKBOOK_ENTRY_TYPE: {
            return {
                ...state,
                createWorkbookEntry: {
                    type: action.data,
                },
            };
        }

        case RESET_CREATE_WORKBOOK_ENTRY_TYPE: {
            return {
                ...state,
                createWorkbookEntry: initialState.createWorkbookEntry,
            };
        }

        // Renaming the entry
        case RENAME_ENTRY_LOADING: {
            return {
                ...state,
                renameEntry: {
                    isLoading: true,
                    data: null,
                    error: null,
                },
            };
        }
        case RENAME_ENTRY_SUCCESS: {
            return {
                ...state,
                renameEntry: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case RENAME_ENTRY_FAILED: {
            return {
                ...state,
                renameEntry: {
                    ...state.renameEntry,
                    isLoading: false,
                    error: action.error,
                },
            };
        }
        case RENAME_ENTRY_INLINE: {
            return {
                ...state,
                items: state.items.map((item) => {
                    const renamedEntry = action.data[0];
                    if (renamedEntry.entryId === item.entryId) {
                        const newItem = {...item} as GetEntryResponse;

                        Object.keys(newItem).forEach((key) => {
                            const typedKey = key as keyof EntryFields;

                            if (typedKey in renamedEntry) {
                                (newItem as any)[typedKey] = renamedEntry[typedKey];
                            }
                        });

                        return newItem;
                    }
                    return item;
                }),
            };
        }

        // Change favorite the entry
        case CHANGE_FAVORITE_ENTRY_LOADING: {
            return {
                ...state,
                changeFavoriteEntry: {
                    isLoading: true,
                    data: null,
                    error: null,
                },
            };
        }
        case CHANGE_FAVORITE_ENTRY_SUCCESS: {
            return {
                ...state,
                changeFavoriteEntry: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case CHANGE_FAVORITE_ENTRY_FAILED: {
            return {
                ...state,
                changeFavoriteEntry: {
                    ...state.changeFavoriteEntry,
                    isLoading: false,
                    error: action.error,
                },
            };
        }
        case CHANGE_FAVORITE_ENTRY_INLINE: {
            const changeFavoriteEntry = Array.isArray(action.data) ? action.data[0] : action.data;
            const mapItemsCallback = (item: GetEntryResponse) => {
                if (changeFavoriteEntry.entryId === item.entryId) {
                    const newItem = {...item} as GetEntryResponse;

                    newItem.isFavorite = !newItem.isFavorite;

                    return newItem;
                }
                return item;
            };

            return {
                ...state,
                sharedItems: state.sharedItems.map(mapItemsCallback),
                items: state.items.map(mapItemsCallback),
            };
        }

        // Deleting an entry
        case DELETE_ENTRY_LOADING: {
            return {
                ...state,
                deleteEntry: {
                    isLoading: true,
                    data: null,
                    error: null,
                },
            };
        }
        case DELETE_ENTRY_SUCCESS: {
            return {
                ...state,
                deleteEntry: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case DELETE_ENTRY_FAILED: {
            return {
                ...state,
                deleteEntry: {
                    ...state.deleteEntry,
                    isLoading: false,
                    error: action.error,
                },
            };
        }
        case DELETE_ENTRY_INLINE: {
            return {
                ...state,
                items: state.items.filter((item) => {
                    if (action.data.entryId === item.entryId) {
                        return false;
                    }
                    return true;
                }),
            };
        }

        case CHANGE_FILTERS: {
            return {
                ...state,
                filters: {
                    ...state.filters,
                    ...action.data,
                },
            };
        }

        case ADD_WORKBOOK_INFO: {
            return {
                ...state,
                workbooksNames: {
                    ...state.workbooksNames,
                    [action.data.workbookId]: action.data.workbookName,
                },
                workbookPermissions: action.data.workbookPermissions,
                workbookBreadcrumbs: action.data.workbookBreadcrumbs,
            };
        }

        case RESET_WORKBOOK_PERMISSIONS: {
            return {
                ...state,
                workbookPermissions: null,
            };
        }

        case SET_WORKBOOK: {
            return {
                ...state,
                getWorkbook: {
                    isLoading: false,
                    data: action.data.workbook,
                    error: null,
                },
            };
        }

        default: {
            return state;
        }
    }
};
