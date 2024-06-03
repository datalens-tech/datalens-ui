import {
    RESET_STATE,
    GET_ENTRY_LOADING,
    GET_ENTRY_SUCCESS,
    GET_ENTRY_FAILED,
    GET_RELATIONS_LOADING,
    GET_RELATIONS_SUCCESS,
    GET_RELATIONS_FAILED,
    COPY_ENTRIES_TO_WORKBOOK_LOADING,
    COPY_ENTRIES_TO_WORKBOOK_SUCCESS,
    COPY_ENTRIES_TO_WORKBOOK_FAILED,
} from '../constants/copyEntriesToWorkbook';

import type {CopyingEntiesToWorkbookAction} from '../actions/copyEntriesToWorkbook';

import type {
    GetEntryResponse,
    GetRelationsResponse,
    CopyEntriesToWorkbookResponse,
} from '../../../shared/schema';

export type CopyEntriesToWorkbookState = {
    getEntry: {
        isLoading: boolean;
        data: GetEntryResponse | null;
        error: Error | null;
    };
    getRelations: {
        isLoading: boolean;
        data: GetRelationsResponse | null;
        error: Error | null;
    };
    copyEntriesToWorkbook: {
        isLoading: boolean;
        data: CopyEntriesToWorkbookResponse | null;
        error: Error | null;
    };
};

const initialState: CopyEntriesToWorkbookState = {
    getEntry: {
        isLoading: false,
        data: null,
        error: null,
    },
    getRelations: {
        isLoading: false,
        data: null,
        error: null,
    },
    copyEntriesToWorkbook: {
        isLoading: false,
        data: null,
        error: null,
    },
};

// eslint-disable-next-line complexity
export const copyEntriesToWorkbook = (
    state: CopyEntriesToWorkbookState = initialState,
    action: CopyingEntiesToWorkbookAction,
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

        case COPY_ENTRIES_TO_WORKBOOK_LOADING: {
            return {
                ...state,
                copyEntriesToWorkbook: {
                    ...state.copyEntriesToWorkbook,
                    isLoading: true,
                    error: null,
                },
            };
        }
        case COPY_ENTRIES_TO_WORKBOOK_SUCCESS: {
            return {
                ...state,
                copyEntriesToWorkbook: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case COPY_ENTRIES_TO_WORKBOOK_FAILED: {
            return {
                ...state,
                copyEntriesToWorkbook: {
                    ...state.copyEntriesToWorkbook,
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
