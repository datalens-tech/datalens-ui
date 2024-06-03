import {
    RESET_STATE,
    GET_ENTRY_LOADING,
    GET_ENTRY_SUCCESS,
    GET_ENTRY_FAILED,
    GET_RELATIONS_GRAPH_LOADING,
    GET_RELATIONS_GRAPH_SUCCESS,
    GET_RELATIONS_GRAPH_FAILED,
    GET_RELATIONS_LOADING,
    GET_RELATIONS_SUCCESS,
    GET_RELATIONS_FAILED,
    MIGRATE_ENTRIES_TO_WORKBOOK_LOADING,
    MIGRATE_ENTRIES_TO_WORKBOOK_SUCCESS,
    MIGRATE_ENTRIES_TO_WORKBOOK_FAILED,
} from '../constants/migrationToWorkbook';
import type {MigrationToWorkbookAction} from '../actions/migrationToWorkbook';
import type {
    GetEntryResponse,
    GetRelationsGraphResponse,
    GetRelationsResponse,
    MigrateEntriesToWorkbookResponse,
} from '../../../shared/schema';

export type MigrationToWorkbookState = {
    getEntry: {
        isLoading: boolean;
        data: GetEntryResponse | null;
        error: Error | null;
    };
    getRelationsGraph: {
        isLoading: boolean;
        data: GetRelationsGraphResponse | null;
        error: Error | null;
    };
    getRelations: {
        isLoading: boolean;
        data: GetRelationsResponse | null;
        error: Error | null;
    };
    migrateEntriesToWorkbook: {
        isLoading: boolean;
        data: MigrateEntriesToWorkbookResponse | null;
        error: Error | null;
    };
};

const initialState: MigrationToWorkbookState = {
    getEntry: {
        isLoading: false,
        data: null,
        error: null,
    },
    getRelationsGraph: {
        isLoading: false,
        data: null,
        error: null,
    },
    getRelations: {
        isLoading: false,
        data: null,
        error: null,
    },
    migrateEntriesToWorkbook: {
        isLoading: false,
        data: null,
        error: null,
    },
};

// eslint-disable-next-line complexity
export const migrationToWorkbook = (
    state: MigrationToWorkbookState = initialState,
    action: MigrationToWorkbookAction,
) => {
    switch (action.type) {
        case RESET_STATE: {
            return initialState;
        }

        case GET_ENTRY_LOADING: {
            return {
                ...state,
                getEntry: {
                    ...state.getEntry,
                    isLoading: true,
                    error: null,
                },
            };
        }
        case GET_ENTRY_SUCCESS: {
            return {
                ...state,
                getEntry: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case GET_ENTRY_FAILED: {
            return {
                ...state,
                getEntry: {
                    ...state.getEntry,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        case GET_RELATIONS_GRAPH_LOADING: {
            return {
                ...state,
                getRelationsGraph: {
                    ...state.getRelationsGraph,
                    isLoading: true,
                    error: null,
                },
            };
        }
        case GET_RELATIONS_GRAPH_SUCCESS: {
            return {
                ...state,
                getRelationsGraph: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case GET_RELATIONS_GRAPH_FAILED: {
            return {
                ...state,
                getRelationsGraph: {
                    ...state.getRelationsGraph,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        case GET_RELATIONS_LOADING: {
            return {
                ...state,
                getRelations: {
                    ...state.getRelations,
                    isLoading: true,
                    error: null,
                },
            };
        }
        case GET_RELATIONS_SUCCESS: {
            return {
                ...state,
                getRelations: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case GET_RELATIONS_FAILED: {
            return {
                ...state,
                getRelations: {
                    ...state.getRelations,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        case MIGRATE_ENTRIES_TO_WORKBOOK_LOADING: {
            return {
                ...state,
                migrateEntriesToWorkbook: {
                    ...state.migrateEntriesToWorkbook,
                    isLoading: true,
                    error: null,
                },
            };
        }
        case MIGRATE_ENTRIES_TO_WORKBOOK_SUCCESS: {
            return {
                ...state,
                migrateEntriesToWorkbook: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case MIGRATE_ENTRIES_TO_WORKBOOK_FAILED: {
            return {
                ...state,
                migrateEntriesToWorkbook: {
                    ...state.migrateEntriesToWorkbook,
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
