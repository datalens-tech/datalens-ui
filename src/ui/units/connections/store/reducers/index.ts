import type {FormDict} from '../../typings';
import {
    RESET_FORMS_DATA,
    RESET_S3_BASED_DATA,
    SET_BEING_DELETED_SOURCE_ID,
    SET_CACHED_HTML_ITEM,
    SET_CHECK_DATA,
    SET_CHECK_LOADING,
    SET_CONNECTION_KEY,
    SET_CONNECTOR_DATA,
    SET_ENTRY,
    SET_FILE_COLUMN_FILTER,
    SET_FILE_REPLACE_SOURCES,
    SET_FILE_SELECTED_ITEM_ID,
    SET_FILE_SOURCES,
    SET_FLATTEN_CONNECTORS,
    SET_FORM,
    SET_GROUPED_CONNECTORS,
    SET_GSHEET_ACTIVE_DIALOG,
    SET_GSHEET_ADD_SECTION_STATE,
    SET_GSHEET_COLUMN_FILTER,
    SET_GSHEET_ITEMS,
    SET_GSHEET_SELECTED_ITEM_ID,
    SET_INITIAL_FORM,
    SET_INITIAL_STATE,
    SET_INNER_FORM,
    SET_PAGE_LOADING,
    SET_REPLACE_SOURCE_ACTION_DATA,
    SET_SCHEMA,
    SET_SCHEMA_LOADING,
    SET_SUBMIT_LOADING,
    SET_UPLOADED_FILES,
    SET_VALIDATION_ERRORS,
    SET_YADOCS_ACTIVE_DIALOG,
    SET_YADOCS_COLUMN_FILTER,
    SET_YADOCS_ITEMS,
    SET_YADOCS_SELECTED_ITEM_ID,
} from '../actions';
import {initialState} from '../constants';
import type {ConnectionsReduxAction, ConnectionsReduxState} from '../typings';

// eslint-disable-next-line complexity
export default (state = initialState, action: ConnectionsReduxAction): ConnectionsReduxState => {
    switch (action.type) {
        case SET_GROUPED_CONNECTORS: {
            const {groupedConnectors, error} = action.payload;
            return {
                ...state,
                groupedConnectors,
                apiErrors: {
                    ...state.apiErrors,
                    connectors: error,
                },
            };
        }
        case SET_FLATTEN_CONNECTORS: {
            const {flattenConnectors} = action.payload;
            return {
                ...state,
                flattenConnectors,
            };
        }
        case SET_CONNECTOR_DATA: {
            const {connectionData, error} = action.payload;
            return {
                ...state,
                connectionData,
                apiErrors: {
                    ...state.apiErrors,
                    connection: error,
                },
            };
        }
        case SET_ENTRY: {
            const {entry, error} = action.payload;
            return {
                ...state,
                entry,
                apiErrors: {
                    ...state.apiErrors,
                    entry: error,
                },
            };
        }
        case SET_CONNECTION_KEY: {
            if (!state.entry) {
                return state;
            }
            return {
                ...state,
                entry: {...state.entry, key: action.payload},
            };
        }
        case SET_FORM: {
            const {updates} = action.payload;
            const nextForm: FormDict = {...state.form, ...updates};
            return {
                ...state,
                form: nextForm,
            };
        }
        case SET_INITIAL_FORM: {
            const {updates} = action.payload;
            return {
                ...state,
                initialForm: {
                    ...state.initialForm,
                    ...updates,
                },
            };
        }
        case SET_INNER_FORM: {
            const {updates} = action.payload;
            return {
                ...state,
                innerForm: {
                    ...state.innerForm,
                    ...updates,
                },
            };
        }
        case SET_CACHED_HTML_ITEM: {
            const {hash, html} = action.payload;
            return {
                ...state,
                cachedHtml: {
                    ...state.cachedHtml,
                    [hash]: html,
                },
            };
        }
        case SET_SCHEMA: {
            const {schema, error} = action.payload;
            return {
                ...state,
                schema,
                apiErrors: {
                    ...state.apiErrors,
                    schema: error,
                },
            };
        }
        case SET_VALIDATION_ERRORS: {
            const {errors} = action.payload;
            return {
                ...state,
                validationErrors: errors,
            };
        }
        case SET_INITIAL_STATE: {
            return {
                ...state,
                form: {},
                initialForm: {},
                innerForm: {},
                connectionData: {},
                checkData: {
                    status: 'unknown',
                },
                apiErrors: {},
                validationErrors: [],
                file: initialState.file,
                gsheet: initialState.gsheet,
                yadocs: initialState.yadocs,
                schema: undefined,
            };
        }
        case SET_PAGE_LOADING: {
            const {pageLoading} = action.payload;
            return {
                ...state,
                ui: {
                    ...state.ui,
                    pageLoading,
                },
            };
        }
        case SET_CHECK_LOADING: {
            const {loading} = action.payload;
            return {
                ...state,
                ui: {
                    ...state.ui,
                    checkLoading: loading,
                },
            };
        }
        case SET_CHECK_DATA: {
            const {status, error} = action.payload;
            return {
                ...state,
                checkData: {status, error},
            };
        }
        case SET_SUBMIT_LOADING: {
            const {loading} = action.payload;
            return {
                ...state,
                ui: {
                    ...state.ui,
                    submitLoading: loading,
                },
            };
        }
        case SET_SCHEMA_LOADING: {
            const {schemaLoading} = action.payload;
            return {
                ...state,
                ui: {...state.ui, schemaLoading},
            };
        }
        case RESET_FORMS_DATA: {
            return {
                ...state,
                form: {},
                initialForm: {},
            };
        }
        case SET_UPLOADED_FILES: {
            const {uploadedFiles} = action.payload;
            return {
                ...state,
                file: {
                    ...state.file,
                    uploadedFiles,
                },
            };
        }
        case SET_FILE_SOURCES: {
            const {sources} = action.payload;
            return {
                ...state,
                file: {
                    ...state.file,
                    sources,
                },
            };
        }
        case SET_FILE_SELECTED_ITEM_ID: {
            const {selectedItemId} = action.payload;
            return {
                ...state,
                file: {
                    ...state.file,
                    selectedItemId,
                },
            };
        }
        case SET_FILE_COLUMN_FILTER: {
            const {columnFilter} = action.payload;
            return {
                ...state,
                file: {
                    ...state.file,
                    columnFilter,
                },
            };
        }
        case SET_BEING_DELETED_SOURCE_ID: {
            const {beingDeletedSourceId} = action.payload;
            return {
                ...state,
                file: {
                    ...state.file,
                    beingDeletedSourceId,
                },
            };
        }
        case SET_FILE_REPLACE_SOURCES: {
            const {replaceSources} = action.payload;
            return {
                ...state,
                file: {
                    ...state.file,
                    replaceSources,
                },
            };
        }
        case SET_REPLACE_SOURCE_ACTION_DATA: {
            const {replaceSourceActionData} = action.payload;
            return {
                ...state,
                file: {
                    ...state.file,
                    replaceSourceActionData: {
                        ...state.file.replaceSourceActionData,
                        ...replaceSourceActionData,
                    },
                },
            };
        }
        case RESET_S3_BASED_DATA: {
            return {
                ...state,
                file: initialState.file,
                gsheet: initialState.gsheet,
                yadocs: initialState.yadocs,
            };
        }
        case SET_GSHEET_ADD_SECTION_STATE: {
            return {
                ...state,
                gsheet: {
                    ...state.gsheet,
                    addSectionState: {
                        ...state.gsheet.addSectionState,
                        ...action.payload,
                    },
                },
            };
        }
        case SET_GSHEET_SELECTED_ITEM_ID: {
            const {selectedItemId} = action.payload;
            return {
                ...state,
                gsheet: {
                    ...state.gsheet,
                    selectedItemId,
                },
            };
        }
        case SET_GSHEET_COLUMN_FILTER: {
            const {columnFilter} = action.payload;
            return {
                ...state,
                gsheet: {
                    ...state.gsheet,
                    columnFilter,
                },
            };
        }
        case SET_GSHEET_ITEMS: {
            const {items} = action.payload;
            return {
                ...state,
                gsheet: {
                    ...state.gsheet,
                    items,
                },
            };
        }
        case SET_GSHEET_ACTIVE_DIALOG: {
            const {activeDialog} = action.payload;
            return {
                ...state,
                gsheet: {
                    ...state.gsheet,
                    activeDialog,
                },
            };
        }
        case SET_YADOCS_ITEMS: {
            const {items} = action.payload;
            return {
                ...state,
                yadocs: {
                    ...state.yadocs,
                    items,
                },
            };
        }

        case SET_YADOCS_SELECTED_ITEM_ID: {
            const {selectedItemId} = action.payload;
            return {
                ...state,
                yadocs: {
                    ...state.yadocs,
                    selectedItemId,
                },
            };
        }
        case SET_YADOCS_ACTIVE_DIALOG: {
            const {activeDialog} = action.payload;
            return {
                ...state,
                yadocs: {
                    ...state.yadocs,
                    activeDialog,
                },
            };
        }
        case SET_YADOCS_COLUMN_FILTER: {
            const {columnFilter} = action.payload;
            return {
                ...state,
                yadocs: {
                    ...state.yadocs,
                    columnFilter,
                },
            };
        }
        default: {
            return state;
        }
    }
};
