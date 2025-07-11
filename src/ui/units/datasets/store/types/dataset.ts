import type {ApplyData} from 'components/DialogFilter/DialogFilter';

import type {
    ConnectionData,
    Dataset,
    DatasetAvatarRelation,
    DatasetField,
    DatasetSource,
    DatasetSourceAvatar,
    Permissions,
    WorkbookId,
} from '../../../../../shared';
import type {ValidateDatasetResponse} from '../../../../../shared/schema';
import type {DatasetTab} from '../../constants';
import type {
    ADD_AVATAR_PROTOTYPES,
    ADD_AVATAR_TEMPLATE,
    ADD_CONNECTION,
    ADD_FIELD,
    ADD_OBLIGATORY_FILTER,
    AVATAR_ADD,
    AVATAR_DELETE,
    BATCH_DELETE_FIELDS,
    BATCH_UPDATE_FIELDS,
    CHANGE_AMOUNT_PREVIEW_ROWS,
    CLEAR_PREVIEW,
    CLICK_CONNECTION,
    CLOSE_PREVIEW,
    CONNECTION_REPLACE,
    DATASET_FETCH_FAILURE,
    DATASET_FETCH_REQUEST,
    DATASET_FETCH_SUCCESS,
    DATASET_INITIAL_FETCH_FAILURE,
    DATASET_INITIAL_FETCH_REQUEST,
    DATASET_INITIAL_FETCH_SUCCESS,
    DATASET_SAVE_FAILURE,
    DATASET_SAVE_REQUEST,
    DATASET_SAVE_SUCCESS,
    DATASET_VALIDATE_FAILURE,
    DATASET_VALIDATE_REQUEST,
    DATASET_VALIDATE_SUCCESS,
    DELETE_CONNECTION,
    DELETE_FIELD,
    DELETE_OBLIGATORY_FILTER,
    DUPLICATE_FIELD,
    EDITOR_SET_FILTER,
    EDITOR_SET_ITEMS_TO_DISPLAY,
    FIELD_TYPES_FETCH_SUCCESS,
    INITIALIZE_DATASET,
    OPEN_PREVIEW,
    PREVIEW_DATASET_FETCH_FAILURE,
    PREVIEW_DATASET_FETCH_REQUEST,
    PREVIEW_DATASET_FETCH_SUCCESS,
    RELATION_ADD,
    RELATION_DELETE,
    RELATION_UPDATE,
    RENAME_DATASET,
    RESET_DATASET_STATE,
    SET_CURRENT_TAB,
    SET_DATASET_REVISION_MISMATCH,
    SET_DATA_EXPORT_ENABLED,
    SET_EDIT_HISTORY_STATE,
    SET_FREEFORM_SOURCES,
    SET_INITIAL_SOURCES,
    SET_IS_DATASET_CHANGED_FLAG,
    SET_LAST_MODIFIED_TAB,
    SET_QUEUE_TO_LOAD_PREVIEW,
    SET_SOURCES_LOADING_ERROR,
    SET_TEMPLATE_ENABLED,
    SET_UPDATES,
    SET_VALIDATION_STATE,
    SOURCES_REFRESH,
    SOURCE_ADD,
    SOURCE_DELETE,
    SOURCE_REPLACE,
    SOURCE_UPDATE,
    TOGGLE_ALLOWANCE_SAVE,
    TOGGLE_FIELD_EDITOR_MODULE_LOADING,
    TOGGLE_LOAD_PREVIEW_BY_DEFAULT,
    TOGGLE_PREVIEW,
    TOGGLE_SOURCES_LOADER,
    TOGGLE_VIEW_PREVIEW,
    UPDATE_FIELD,
    UPDATE_OBLIGATORY_FILTER,
    UPDATE_RLS,
} from '../actions/types/dataset';
import type {EDIT_HISTORY_OPTIONS_KEY} from '../constants';

// TODO: correctly describe the type
export type DatasetError = any | null;

export type ConnectionEntry = {
    data: ConnectionData;
    id?: string;
    entryId: string;
    type: string;
    permissions?: Permissions;
    workbookId: WorkbookId;
};

export type BaseSource = {
    connection_id: string;
    disabled: boolean;
    group: []; // TODO: correctly describe the type
    is_ref: boolean;
    parameter_hash: string;
    parameters: {[k: string]: string};
    ref_source_id: string | null;
    source_type: string; // perhaps it will be necessary to clarify the type here
    title: string;
    managed_by?: 'user';
};

type FieldDocKey =
    | 'CHYT_TABLE/table_name'
    | 'CHYT_TABLE_LIST/table_names'
    | 'CHYT_TABLE_LIST/title'
    | 'CHYT_TABLE_RANGE/title'
    | 'CHYT_USER_AUTH_TABLE_LIST/title'
    | 'CHYT_USER_AUTH_TABLE_RANGE/title'
    | 'CHYT_USER_AUTH_TABLE/table_name'
    | 'CHYT_USER_AUTH_TABLE/table_names'
    | 'CHYT_TABLE_RANGE/directory_path'
    | 'CHYDB_TABLE/table_name'
    | 'CHYDB_TABLE/ydb_database'
    | 'ANY_SUBSELECT/subsql'
    | 'CHYT_SUBSELECT/subsql'
    | 'MSSQL_SUBSELECT/subsql'
    | 'PG_SUBSELECT/subsql'
    | 'YTsaurus/CHYT_TABLE/table_name'
    | 'CHYT_YTSAURUS_TABLE_LIST/title'
    | 'YTsaurus/CHYT_TABLE_LIST/table_names'
    | 'CHYT_YTSAURUS_TABLE_RANGE/title'
    | 'YTsaurus/CHYT_TABLE_RANGE/directory_path'
    | 'YTsaurus/CHYT_SUBSELECT/subsql';

export type TranslatedItem = {
    en: string;
    ru: string;
};

export type StandaloneSource = {id: string} & BaseSource;

export type SourcePrototype = DatasetSource & {
    id?: string;
    isSource?: boolean;
    isConnectedWithAvatar?: boolean;
};

type BaseOptions = {
    name: string;
    default: string;
    title: TranslatedItem;
    required?: boolean;
    field_doc_key?: FieldDocKey;
    template_enabled?: boolean;
};

export type TextFormOptions = {input_type: 'text'} & BaseOptions;

export type TextareaFormOptions = {input_type: 'textarea'} & BaseOptions;

type SqlFormOptions = {input_type: 'sql'} & BaseOptions;

export type SelectFormOptions = {
    input_type: 'select';
    select_options: string[];
    select_allow_user_input: boolean;
} & BaseOptions;

export type FormOptions =
    | TextFormOptions
    | TextareaFormOptions
    | SqlFormOptions
    | SelectFormOptions;

export type FreeformSource = {
    form: FormOptions[];
    tab_title: TranslatedItem;
} & BaseSource;

export type EditHistoryOptions = {
    stacked?: boolean;
    tab?: DatasetTab;
};

type EditHistoryOptionsProperty = {
    [EDIT_HISTORY_OPTIONS_KEY]?: EditHistoryOptions;
};

type AddFieldUpdate = {
    action: 'add_field';
    field: Partial<DatasetField>;
};
type DeleteFieldUpdate = {
    action: 'delete_field';
    field: Partial<DatasetField>;
};
type ChangeFieldUpdate = {
    action: 'update_field';
    field: Partial<DatasetField>;
};
type AddSourceUpdate = {
    action: 'add_source';
    source: StandaloneSource | DatasetSource;
};
type SourceRefreshUpdate = {
    action: 'refresh_source';
    source: {
        id: string;
    };
};
type UpdSourceUpdate = {
    action: 'update_source';
    source: StandaloneSource;
};
type AddSourceAvatarUpdate = {
    action: 'add_source_avatar';
    source_avatar: {
        id: string;
        source_id: string;
        title: string;
    };
};
type UpdateSourceAvatarUpdate = {
    action: 'update_source_avatar';
    source_avatar: {
        id: string;
        source_id: string;
        title: string;
    };
};
type AddAvatarRelationUpdate = {
    action: 'add_avatar_relation';
    source_avatar: {
        conditions: string[]; // TODO: correctly describe the type
        id: string;
        join_type: string; // TODO: correctly describe the type
        left_avatar_id: string;
        right_avatar_id: String;
    };
};

type DeleteAvatarRelationUpdate = {
    action: 'delete_avatar_relation';
    avatar_relation: {
        id: string;
    };
};

type DeleteSourceAvatarUpdate = {
    action: 'delete_source_avatar';
    source_avatar: {
        id: string;
    };
};

type DeleteSourceUpdate = {
    action: 'delete_source';
    source: {
        id: string;
    };
};

type UpdateConnection = {
    action: 'replace_connection';
    connection: {
        id: string;
        new_id: string;
    };
};

export type UpdateSetting = {
    action: 'update_setting';
    setting: {
        name: 'load_preview_by_default' | 'template_enabled' | 'data_export_forbidden';
        value: boolean;
    };
};

export type Update =
    | AddFieldUpdate
    | DeleteFieldUpdate
    | ChangeFieldUpdate
    | AddSourceUpdate
    | UpdSourceUpdate
    | AddSourceAvatarUpdate
    | UpdateSourceAvatarUpdate
    | AddAvatarRelationUpdate
    | DeleteAvatarRelationUpdate
    | DeleteSourceAvatarUpdate
    | DeleteSourceUpdate
    | UpdateConnection
    | SourceRefreshUpdate
    | UpdateSetting;

export type EditorItemToDisplay = 'fieldsId' | 'hiddenFields';

export type DatasetReduxState = {
    isLoading: boolean;
    isFavorite: boolean;
    isDatasetRevisionMismatch: boolean;
    id: string;
    key: string;
    workbookId: WorkbookId;
    permissions?: Permissions;
    connection: ConnectionEntry | null;
    content: Partial<Dataset['dataset']>;
    prevContent: Partial<Dataset['dataset']>;
    options: Dataset['options'] | object;
    preview: {
        previewEnabled: boolean;
        readyPreview: 'loading' | 'failed' | null;
        isVisible: boolean;
        isLoading: boolean;
        amountPreviewRows: number;
        view: 'full' | 'bottom' | 'right';
        data: string[]; // TODO: correctly describe the type
        error: DatasetError;
        isQueued: boolean;
    };
    errors: {
        previewError: DatasetError;
        savingError: DatasetError;
        sourceLoadingError: DatasetError;
        validationError: DatasetError;
    };
    validation: {
        isLoading: boolean;
        isPending: boolean;
        error: DatasetError;
    };
    savingDataset: {
        disabled: boolean;
        isProcessingSavingDataset: boolean;
        error: DatasetError;
    };
    types: {
        // TODO: the same type is in the scheme, it is necessary to sleep properly
        data: {
            name: string;
            aggregations: string[];
        }[];
        error: DatasetError;
    };
    ui: {
        selectedConnectionId: string | null;
        isDatasetChanged: boolean;
        isFieldEditorModuleLoading: boolean;
        isSourcesLoading: boolean;
    };
    editor: {
        filter: string;
        itemsToDisplay: EditorItemToDisplay[];
    };
    updates: Update[];
    freeformSources: FreeformSource[];
    selectedConnections: ConnectionEntry[];
    sourcePrototypes: SourcePrototype[];
    sourceTemplate: FreeformSource | null; // TODO: abandon this thing in favor of freeformSources
    error: DatasetError;
    currentTab: DatasetTab;
    lastModifiedTab?: DatasetTab;
};

type SetFreeformSources = {
    type: typeof SET_FREEFORM_SOURCES;
    payload: {freeformSources: FreeformSource[]};
};

type ResetDatasetState = {
    type: typeof RESET_DATASET_STATE;
};

type SetDatasetRevisionMismatch = {
    type: typeof SET_DATASET_REVISION_MISMATCH;
};

type SetSourcesLoadingError = {
    type: typeof SET_SOURCES_LOADING_ERROR;
    payload: {
        error: DatasetError;
    };
};

type ToggleSourcesLoader = {
    type: typeof TOGGLE_SOURCES_LOADER;
    payload: {
        isSourcesLoading: boolean;
    };
};

type ToggleFieldEditorModuleLoading = {
    type: typeof TOGGLE_FIELD_EDITOR_MODULE_LOADING;
    payload: {
        isLoading: boolean;
    };
};

type AddAvatarTemplate = {
    type: typeof ADD_AVATAR_TEMPLATE;
    payload: {
        template: FreeformSource;
    };
};

type AddAvatarPrototypes = {
    type: typeof ADD_AVATAR_PROTOTYPES;
    payload: {
        list: BaseSource[];
        templates: FreeformSource;
    };
};

type DeleteConnection = {
    type: typeof DELETE_CONNECTION;
    payload: {
        connectionId: string;
    } & EditHistoryOptionsProperty;
};

type AddConnection = {
    type: typeof ADD_CONNECTION;
    payload: {
        connection: ConnectionEntry;
    } & EditHistoryOptionsProperty;
};

type ClickConnection = {
    type: typeof CLICK_CONNECTION;
    payload: {
        connectionId: string;
    };
};

type SetInitialSources = {
    type: typeof SET_INITIAL_SOURCES;
    payload: {
        selectedConnection: ConnectionEntry;
        selectedConnections: ConnectionEntry[];
    };
};

type SetIsDatasetChangedFlag = {
    type: typeof SET_IS_DATASET_CHANGED_FLAG;
    payload: {
        isDatasetChanged: boolean;
    };
};

type UpdateRls = {
    type: typeof UPDATE_RLS;
    payload: {
        rls: {[key: string]: string};
    } & EditHistoryOptionsProperty;
};

type UpdateField = {
    type: typeof UPDATE_FIELD;
    payload: {
        field: Partial<DatasetField>;
        ignoreMergeWithSchema?: boolean;
    } & EditHistoryOptionsProperty;
};

type BatchUpdateFields = {
    type: typeof BATCH_UPDATE_FIELDS;
    payload: {
        fields: Partial<DatasetField>[];
        ignoreMergeWithSchema?: boolean;
    } & EditHistoryOptionsProperty;
};

type DeleteField = {
    type: typeof DELETE_FIELD;
    payload: {
        field: Partial<DatasetField>;
    } & EditHistoryOptionsProperty;
};

type BatchDeleteFields = {
    type: typeof BATCH_DELETE_FIELDS;
    payload: {
        fields: Partial<DatasetField>[];
    } & EditHistoryOptionsProperty;
};

type DuplicateField = {
    type: typeof DUPLICATE_FIELD;
    payload: {
        field: DatasetField;
    } & EditHistoryOptionsProperty;
};

type AddField = {
    type: typeof ADD_FIELD;
    payload: {
        field: Partial<DatasetField>;
        // Allows you to ignore the merges of the field and the old scheme.
        // If true, the field will not be added to the schema before validation and the field will appear in the future after the response from the backend
        // If false, the field will be added to the old schema before validation.
        ignoreMergeWithSchema?: boolean;
    } & EditHistoryOptionsProperty;
};

type ToggleViewPreview = {
    type: typeof TOGGLE_VIEW_PREVIEW;
    payload: {
        view: 'full' | 'bottom' | 'right';
    };
};

type TogglePreview = {
    type: typeof TOGGLE_PREVIEW;
};

type SetQueueToLoadPreview = {
    type: typeof SET_QUEUE_TO_LOAD_PREVIEW;
    payload: {
        enable: boolean;
    };
};

type ToggleLoadPreviewByDefault = {
    type: typeof TOGGLE_LOAD_PREVIEW_BY_DEFAULT;
    payload: {
        enable: boolean;
    } & EditHistoryOptionsProperty;
};

type ClosePreview = {
    type: typeof CLOSE_PREVIEW;
};

type OpenPreview = {
    type: typeof OPEN_PREVIEW;
};

type ChangeAmountPreviewRows = {
    type: typeof CHANGE_AMOUNT_PREVIEW_ROWS;
    payload: {
        amountPreviewRows: number;
    } & EditHistoryOptionsProperty;
};

export type ToggleAllowanceSave = {
    type: typeof TOGGLE_ALLOWANCE_SAVE;
    payload: {
        enable: boolean;
        validationPending?: boolean;
    } & EditHistoryOptionsProperty;
};

type ClearPreview = {
    type: typeof CLEAR_PREVIEW;
};

type InitializeDataset = {
    type: typeof INITIALIZE_DATASET;
};

type DeleteObligatoryFilter = {
    type: typeof DELETE_OBLIGATORY_FILTER;
    payload: {
        id: string;
    } & EditHistoryOptionsProperty;
};

type UpdateObligatoryFilter = {
    type: typeof UPDATE_OBLIGATORY_FILTER;
    payload: {
        filter: ApplyData;
    } & EditHistoryOptionsProperty;
};

type AddObligatoryFilter = {
    type: typeof ADD_OBLIGATORY_FILTER;
    payload: {
        filter: ApplyData;
    } & EditHistoryOptionsProperty;
};

type DeleteAvatarRelation = {
    type: typeof RELATION_DELETE;
    payload: {
        relationId: string;
    } & EditHistoryOptionsProperty;
};

type UpdateAvatarRelation = {
    type: typeof RELATION_UPDATE;
    payload: {
        relation: DatasetAvatarRelation;
    } & EditHistoryOptionsProperty;
};

type AddAvatarRelation = {
    type: typeof RELATION_ADD;
    payload: {
        relation: DatasetAvatarRelation;
    } & EditHistoryOptionsProperty;
};

type DeleteSourceAvatar = {
    type: typeof AVATAR_DELETE;
    payload: {
        avatarId: string;
    } & EditHistoryOptionsProperty;
};

type AddSourceAvatar = {
    type: typeof AVATAR_ADD;
    payload: {
        avatar: DatasetSourceAvatar;
    } & EditHistoryOptionsProperty;
};

type ReplaceConnection = {
    type: typeof CONNECTION_REPLACE;
    payload: {
        connection?: ConnectionEntry;
        newConnection?: ConnectionEntry;
    } & EditHistoryOptionsProperty;
};

type ReplaceSource = {
    type: typeof SOURCE_REPLACE;
    payload: {
        source: DatasetSource;
        avatar: DatasetSourceAvatar;
    } & EditHistoryOptionsProperty;
};

type SourcesRefresh = {
    type: typeof SOURCES_REFRESH;
    payload?: EditHistoryOptionsProperty;
};

type DeleteSource = {
    type: typeof SOURCE_DELETE;
    payload: {
        sourceId: string;
    } & EditHistoryOptionsProperty;
};

type UpdateSource = {
    type: typeof SOURCE_UPDATE;
    payload: {
        source: DatasetSource;
    } & EditHistoryOptionsProperty;
};

type AddSource = {
    type: typeof SOURCE_ADD;
    payload: {
        source: DatasetSource;
    } & EditHistoryOptionsProperty;
};

type PreviewDatasetFetchFailure = {
    type: typeof PREVIEW_DATASET_FETCH_FAILURE;
    payload: {
        error: any;
    } & EditHistoryOptionsProperty;
};

type PreviewDatasetFetchSuccess = {
    type: typeof PREVIEW_DATASET_FETCH_SUCCESS;
    payload: {
        data: any;
    } & EditHistoryOptionsProperty;
};

type PreviewDatasetFetchRequest = {
    type: typeof PREVIEW_DATASET_FETCH_REQUEST;
};

type DatasetValidateRequest = {
    type: typeof DATASET_VALIDATE_REQUEST;
    payload: {
        initial: boolean;
    };
};

type DatasetValidateSuccess = {
    type: typeof DATASET_VALIDATE_SUCCESS;
    payload: {
        validation: ValidateDatasetResponse;
    };
};

type DatasetValidateFailure = {
    type: typeof DATASET_VALIDATE_FAILURE;
    payload: {
        error: any;
    };
};

type DatasetSaveRequest = {
    type: typeof DATASET_SAVE_REQUEST;
};

type DatasetSaveSuccess = {
    type: typeof DATASET_SAVE_SUCCESS;
};

type DatasetSaveFailure = {
    type: typeof DATASET_SAVE_FAILURE;
    payload: {
        error: any;
    };
};

type DatasetInitialFetchRequest = {
    type: typeof DATASET_INITIAL_FETCH_REQUEST;
};

type DatasetInitialFetchSuccess = {
    type: typeof DATASET_INITIAL_FETCH_SUCCESS;
    payload: {
        dataset: Dataset & {connection: ConnectionEntry | null};
    };
};

type DatasetInitialFetchFailure = {
    type: typeof DATASET_INITIAL_FETCH_FAILURE;
    payload: {
        error: any;
    };
};

type DatasetFetchRequest = {
    type: typeof DATASET_FETCH_REQUEST;
};

type DatasetFetchSuccess = {
    type: typeof DATASET_FETCH_SUCCESS;
    payload: {
        dataset: Dataset & {connection: ConnectionEntry | null};
    };
};

type DatasetFetchFailure = {
    type: typeof DATASET_FETCH_FAILURE;
    payload: {
        error: any;
    };
};

type FieldTypesFetchSuccess = {
    type: typeof FIELD_TYPES_FETCH_SUCCESS;
    payload: {
        types: {
            data: {
                name: string;
                aggregations: string[];
            }[];
            error: DatasetError;
        };
    };
};

type EditorSetFilter = {
    type: typeof EDITOR_SET_FILTER;
    payload: {
        filter: string;
    };
};

type EditorSetItemsToDisplay = {
    type: typeof EDITOR_SET_ITEMS_TO_DISPLAY;
    payload: {
        itemsToDisplay: EditorItemToDisplay[];
    };
};

type RenameDataset = {
    type: typeof RENAME_DATASET;
    payload: string;
};

export type SetEditHistoryState = {
    type: typeof SET_EDIT_HISTORY_STATE;
    payload: {
        state: DatasetReduxState;
    };
};

export type SetCurrentTab = {
    type: typeof SET_CURRENT_TAB;
    payload: {
        currentTab: DatasetTab;
    } & EditHistoryOptionsProperty;
};

export type SetLastModifiedTab = {
    type: typeof SET_LAST_MODIFIED_TAB;
    payload: {
        lastModifiedTab?: DatasetTab;
    };
};

export type SetValidationState = {
    type: typeof SET_VALIDATION_STATE;
    payload: {
        validation: Partial<DatasetReduxState['validation']>;
    };
};

export type SetTemplateEnabled = {
    type: typeof SET_TEMPLATE_ENABLED;
    payload: {
        templateEnabled: boolean;
    } & EditHistoryOptionsProperty;
};

export type SetDataExportEnabled = {
    type: typeof SET_DATA_EXPORT_ENABLED;
    payload: {
        dataExportEnabled: boolean;
    } & EditHistoryOptionsProperty;
};

type SetUpdates = {
    type: typeof SET_UPDATES;
    payload: {
        updates: Update[];
    } & EditHistoryOptionsProperty;
};

export type DatasetReduxAction =
    | SetFreeformSources
    | ResetDatasetState
    | SetDatasetRevisionMismatch
    | SetSourcesLoadingError
    | ToggleSourcesLoader
    | ToggleFieldEditorModuleLoading
    | AddAvatarTemplate
    | AddAvatarPrototypes
    | DeleteConnection
    | AddConnection
    | ClickConnection
    | SetInitialSources
    | SetIsDatasetChangedFlag
    | UpdateRls
    | UpdateField
    | BatchUpdateFields
    | DeleteField
    | BatchDeleteFields
    | DuplicateField
    | AddField
    | ToggleViewPreview
    | TogglePreview
    | SetQueueToLoadPreview
    | ToggleLoadPreviewByDefault
    | ClosePreview
    | OpenPreview
    | ChangeAmountPreviewRows
    | ToggleAllowanceSave
    | ClearPreview
    | InitializeDataset
    | DeleteObligatoryFilter
    | UpdateObligatoryFilter
    | AddObligatoryFilter
    | DeleteAvatarRelation
    | UpdateAvatarRelation
    | AddAvatarRelation
    | DeleteSourceAvatar
    | AddSourceAvatar
    | ReplaceConnection
    | ReplaceSource
    | SourcesRefresh
    | DeleteSource
    | UpdateSource
    | AddSource
    | PreviewDatasetFetchFailure
    | PreviewDatasetFetchSuccess
    | PreviewDatasetFetchRequest
    | DatasetValidateRequest
    | DatasetValidateSuccess
    | DatasetValidateFailure
    | DatasetSaveRequest
    | DatasetSaveSuccess
    | DatasetSaveFailure
    | DatasetInitialFetchRequest
    | DatasetInitialFetchSuccess
    | DatasetInitialFetchFailure
    | DatasetFetchRequest
    | DatasetFetchSuccess
    | DatasetFetchFailure
    | FieldTypesFetchSuccess
    | EditorSetFilter
    | EditorSetItemsToDisplay
    | RenameDataset
    | SetEditHistoryState
    | SetCurrentTab
    | SetLastModifiedTab
    | SetValidationState
    | SetTemplateEnabled
    | SetDataExportEnabled
    | SetUpdates;
