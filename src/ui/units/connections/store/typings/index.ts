import {SelectOption} from '@gravity-ui/uikit';
import type {
    ConnectorItem,
    FormSchema,
    GetConnectorsResponse,
    GetEntryResponse,
} from 'shared/schema/types';
import type {DatalensGlobalState} from 'ui';

import type {AppDispatch} from '../../../../store';
import type {CloseDialogAction, OpenDialogAction} from '../../../../store/actions/dialog';
import type {DataLensApiError} from '../../../../typings';
import type {FormDict, ValidationError} from '../../typings';
import {
    RESET_FORMS_DATA,
    RESET_S3_BASED_DATA,
    SET_BEING_DELETED_SOURCE_ID,
    SET_CACHED_HTML_ITEM,
    SET_CHECK_DATA,
    SET_CHECK_LOADING,
    SET_CLOUD_TREE,
    SET_CLOUD_TREE_LOADING,
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
    SET_SELECT_ITEMS,
    SET_SELECT_ITEMS_LOADING,
    SET_SUBMIT_LOADING,
    SET_UPLOADED_FILES,
    SET_VALIDATION_ERRORS,
} from '../actions';
import {SelectItemsKey} from '../constants';

import type {CloudTree} from './api';
import type {FileSource, ReplaceSourceActionData, UploadedFile} from './file';
import type {GSheetActiveDialog, GSheetAddSectionState, GSheetItem} from './gsheet';
import type {ReplaceSource} from './s3-based';

export * from './file';
export * from './gsheet';
export * from './mdb';
export * from './ydb';
export * from './s3-based';
export * from './api';

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
    cloudTree: CloudTree[];
    validationErrors: ValidationError[];
    selectItems: Record<SelectItemsKey, SelectOption[]>;
    ui: {
        checkLoading: boolean;
        cloudTreeLoading: boolean;
        pageLoading: boolean;
        schemaLoading: boolean;
        submitLoading: boolean;
        itemsLoading: Record<SelectItemsKey, boolean>;
    };
    apiErrors: {
        connectors?: DataLensApiError;
        connection?: DataLensApiError;
        cloudTree?: DataLensApiError;
        entry?: DataLensApiError;
        schema?: DataLensApiError;
    } & Partial<Record<SelectItemsKey, DataLensApiError | undefined>>;
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

export type SetSelectItemsLoading = {
    type: typeof SET_SELECT_ITEMS_LOADING;
    payload: {
        key: SelectItemsKey;
        loading: boolean;
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

export type SetSelectItems = {
    type: typeof SET_SELECT_ITEMS;
    payload: {
        key: SelectItemsKey;
        items: SelectOption[];
        error?: DataLensApiError;
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

export type SetCloudTree = {
    type: typeof SET_CLOUD_TREE;
    payload: {
        cloudTree: CloudTree[];
        error?: DataLensApiError;
    };
};

export type SetCloudTreeLoading = {
    type: typeof SET_CLOUD_TREE_LOADING;
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

export type ConnectionsReduxAction =
    | SetGroupedConnectors
    | SetFlattenConnectors
    | SetConectorData
    | SetEntry
    | SetForm
    | SetInitialForm
    | SetInnerForm
    | SetPageLoading
    | SetSelectItemsLoading
    | SetCachedHtmlItem
    | SetFormSchema
    | SetValidationErrors
    | SetSelectItems
    | SetInitialState
    | SetCheckLoading
    | SetCheckData
    | SetSubmitLoading
    | SetCloudTree
    | SetCloudTreeLoading
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
    | CloseDialogAction;

export type ConnectionsReduxDispatch = AppDispatch<ConnectionsReduxAction>;
