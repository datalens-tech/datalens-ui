import type {
    ConnectorItem,
    FormSchema,
    GetConnectorsResponse,
    GetEntryResponse,
} from 'shared/schema/types';
import type {DatalensGlobalState} from 'ui';

import type {AppDispatch} from '../../../../store';
import type {CloseDialogAction, OpenDialogAction} from '../../../../store/actions/dialog';
import type {EntryContentAction} from '../../../../store/actions/entryContent';
import type {DataLensApiError} from '../../../../typings';
import type {FormDict, ValidationError} from '../../typings';
import type {
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

import type {FileSource, ReplaceSourceActionData, UploadedFile} from './file';
import type {GSheetActiveDialog, GSheetAddSectionState, GSheetItem} from './gsheet';
import type {ReplaceSource} from './s3-based';
import type {YadocItem, YadocsActiveDialog} from './yadocs';

export * from './file';
export * from './gsheet';
export * from './s3-based';
export * from './yadocs';

export type GetState = () => DatalensGlobalState;

export type CheckData = {
    status: 'unknown' | 'success' | 'error';
    error?: DataLensApiError;
};

export type ConnectionsReduxState = {
    /** Groups of available connectors to create */
    groupedConnectors: GetConnectorsResponse;
    /** Flatten `ConnectorItem` list  */
    flattenConnectors: ConnectorItem[];
    /** Form fields used in creation/editing of connection */
    form: FormDict;
    /** Initial form values. Used to compare with `form` */
    initialForm: FormDict;
    /** Fields with technical information that does not provided to connection */
    innerForm: FormDict;
    connectionData: FormDict;
    cachedHtml: Record<string, string>;
    checkData: CheckData;
    validationErrors: ValidationError[];
    ui: {
        checkLoading: boolean;
        pageLoading: boolean;
        schemaLoading: boolean;
        submitLoading: boolean;
    };
    apiErrors: {
        connectors?: DataLensApiError;
        connection?: DataLensApiError;
        entry?: DataLensApiError;
        schema?: DataLensApiError;
    };
    file: {
        uploadedFiles: UploadedFile[];
        sources: FileSource[];
        replaceSources: ReplaceSource[];
        columnFilter: string;
        selectedItemId: string;
        replaceSourceActionData: {
            replaceSourceId?: string;
            showFileSelection?: boolean;
        };
        beingDeletedSourceId?: string;
    };
    gsheet: {
        items: GSheetItem[];
        columnFilter: string;
        selectedItemId: string;
        addSectionState: GSheetAddSectionState;
        activeDialog?: GSheetActiveDialog;
    };
    yadocs: {
        items: YadocItem[];
        columnFilter: string;
        selectedItemId: string;
        activeDialog?: YadocsActiveDialog;
    };
    currentTenantId?: string;
    entry?: GetEntryResponse;
    schema?: FormSchema;
};

export type SetGroupedConnectors = {
    type: typeof SET_GROUPED_CONNECTORS;
    payload: {
        groupedConnectors: GetConnectorsResponse;
        error?: DataLensApiError;
    };
};

export type SetFlattenConnectors = {
    type: typeof SET_FLATTEN_CONNECTORS;
    payload: {
        flattenConnectors: ConnectorItem[];
    };
};

export type SetConectorData = {
    type: typeof SET_CONNECTOR_DATA;
    payload: {
        connectionData: FormDict;
        error?: DataLensApiError;
    };
};

export type SetEntry = {
    type: typeof SET_ENTRY;
    payload: {
        entry: ConnectionsReduxState['entry'];
        error?: DataLensApiError;
    };
};

export type SetConnectionKey = {
    type: typeof SET_CONNECTION_KEY;
    payload: string;
};

export type SetForm = {
    type: typeof SET_FORM;
    payload: {
        updates: ConnectionsReduxState['form'];
    };
};

export type SetInitialForm = {
    type: typeof SET_INITIAL_FORM;
    payload: {
        updates: ConnectionsReduxState['form'];
    };
};

export type SetInnerForm = {
    type: typeof SET_INNER_FORM;
    payload: {
        updates: ConnectionsReduxState['innerForm'];
    };
};

export type SetPageLoading = {
    type: typeof SET_PAGE_LOADING;
    payload: {
        pageLoading: boolean;
    };
};

export type SetCachedHtmlItem = {
    type: typeof SET_CACHED_HTML_ITEM;
    payload: {
        hash: string;
        html: string;
    };
};

export type SetFormSchema = {
    type: typeof SET_SCHEMA;
    payload: {
        schema?: FormSchema;
        error?: DataLensApiError;
    };
};

export type SetValidationErrors = {
    type: typeof SET_VALIDATION_ERRORS;
    payload: {
        errors: ValidationError[];
    };
};

export type SetInitialState = {
    type: typeof SET_INITIAL_STATE;
};

export type SetCheckLoading = {
    type: typeof SET_CHECK_LOADING;
    payload: {
        loading: boolean;
    };
};

export type SetCheckData = {
    type: typeof SET_CHECK_DATA;
    payload: CheckData;
};

export type SetSubmitLoading = {
    type: typeof SET_SUBMIT_LOADING;
    payload: {
        loading: boolean;
    };
};

export type SetSchemaLoading = {
    type: typeof SET_SCHEMA_LOADING;
    payload: {
        schemaLoading: boolean;
    };
};

export type ResetFormsData = {
    type: typeof RESET_FORMS_DATA;
};

export type SetUploadedFiles = {
    type: typeof SET_UPLOADED_FILES;
    payload: {
        uploadedFiles: UploadedFile[];
    };
};

export type SetFileSources = {
    type: typeof SET_FILE_SOURCES;
    payload: {
        sources: ConnectionsReduxState['file']['sources'];
    };
};

export type SetFileSelectedItemId = {
    type: typeof SET_FILE_SELECTED_ITEM_ID;
    payload: {
        selectedItemId: string;
    };
};

export type SetFileColumnFilter = {
    type: typeof SET_FILE_COLUMN_FILTER;
    payload: {
        columnFilter: string;
    };
};

export type SetBeingDeletedSourceId = {
    type: typeof SET_BEING_DELETED_SOURCE_ID;
    payload: {
        beingDeletedSourceId?: string;
    };
};

export type SetFileReplaceSources = {
    type: typeof SET_FILE_REPLACE_SOURCES;
    payload: {
        replaceSources: ReplaceSource[];
    };
};

export type SetReplaceSourceActionData = {
    type: typeof SET_REPLACE_SOURCE_ACTION_DATA;
    payload: {
        replaceSourceActionData: ReplaceSourceActionData;
    };
};

export type ResetS3BasedData = {
    type: typeof RESET_S3_BASED_DATA;
};

export type SetGsheetAddSectionState = {
    type: typeof SET_GSHEET_ADD_SECTION_STATE;
    payload: Partial<GSheetAddSectionState>;
};

export type SetGSheetSelectedItemId = {
    type: typeof SET_GSHEET_SELECTED_ITEM_ID;
    payload: {
        selectedItemId: string;
    };
};

export type SetGSheetColumnFilter = {
    type: typeof SET_GSHEET_COLUMN_FILTER;
    payload: {
        columnFilter: string;
    };
};

export type SetGSheetItems = {
    type: typeof SET_GSHEET_ITEMS;
    payload: {
        items: GSheetItem[];
    };
};

export type SetGSheetActiveDialog = {
    type: typeof SET_GSHEET_ACTIVE_DIALOG;
    payload: {
        activeDialog?: GSheetActiveDialog;
    };
};

export type SetYadocsItems = {
    type: typeof SET_YADOCS_ITEMS;
    payload: {
        items: YadocItem[];
    };
};

export type SetYadocsSelectedItemId = {
    type: typeof SET_YADOCS_SELECTED_ITEM_ID;
    payload: {
        selectedItemId: string;
    };
};

export type SetYadocsActiveDialog = {
    type: typeof SET_YADOCS_ACTIVE_DIALOG;
    payload: {
        activeDialog?: YadocsActiveDialog;
    };
};

export type SetYadocsColumnFilter = {
    type: typeof SET_YADOCS_COLUMN_FILTER;
    payload: {
        columnFilter: string;
    };
};

export type ConnectionsReduxAction =
    | SetGroupedConnectors
    | SetFlattenConnectors
    | SetConectorData
    | SetEntry
    | SetConnectionKey
    | SetForm
    | SetInitialForm
    | SetInnerForm
    | SetPageLoading
    | SetCachedHtmlItem
    | SetFormSchema
    | SetValidationErrors
    | SetInitialState
    | SetCheckLoading
    | SetCheckData
    | SetSubmitLoading
    | SetSchemaLoading
    | ResetFormsData
    | SetUploadedFiles
    | SetFileSources
    | SetFileSelectedItemId
    | SetFileColumnFilter
    | SetBeingDeletedSourceId
    | SetFileReplaceSources
    | SetReplaceSourceActionData
    | ResetS3BasedData
    | SetGsheetAddSectionState
    | SetGSheetSelectedItemId
    | SetGSheetColumnFilter
    | SetGSheetItems
    | SetGSheetActiveDialog
    | OpenDialogAction
    | CloseDialogAction
    | EntryContentAction
    | SetYadocsItems
    | SetYadocsSelectedItemId
    | SetYadocsActiveDialog
    | SetYadocsColumnFilter;

export type ConnectionsReduxDispatch = AppDispatch<ConnectionsReduxAction>;

export type HandleReplacedSourcesArgs =
    | {action: 'add'; replaceSource: ReplaceSource}
    | {action: 'filter'; replacedSourceId: string};
