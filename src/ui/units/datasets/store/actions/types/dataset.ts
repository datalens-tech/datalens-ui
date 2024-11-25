export const INITIALIZE_DATASET = Symbol('dataset/INITIALIZE_DATASET');

export const RESET_DATASET_STATE = Symbol('dataset/RESET_DATASET_STATE');

export const SET_FREEFORM_SOURCES = Symbol('dataset/SET_FREEFORM_SOURCES');

export const FIELD_TYPES_FETCH_SUCCESS = Symbol('dataset/FIELD_TYPES_FETCH_SUCCESS');

export const DATASET_FETCH_REQUEST = Symbol('dataset/DATASET_FETCH_REQUEST');
export const DATASET_FETCH_SUCCESS = Symbol('dataset/DATASET_FETCH_SUCCESS');
export const DATASET_FETCH_FAILURE = Symbol('dataset/DATASET_FETCH_FAILURE');

export const DATASET_INITIAL_FETCH_REQUEST = Symbol('dataset/DATASET_INITIAL_FETCH_REQUEST');
export const DATASET_INITIAL_FETCH_SUCCESS = Symbol('dataset/DATASET_INITIAL_FETCH_SUCCESS');
export const DATASET_INITIAL_FETCH_FAILURE = Symbol('dataset/DATASET_INITIAL_FETCH_FAILURE');

export const DATASET_SAVE_REQUEST = Symbol('dataset/DATASET_SAVE_REQUEST');
export const DATASET_SAVE_SUCCESS = Symbol('dataset/DATASET_SAVE_SUCCESS');
export const DATASET_SAVE_FAILURE = Symbol('dataset/DATASET_SAVE_FAILURE');

export const DATASET_VALIDATE_REQUEST = Symbol('dataset/DATASET_VALIDATE_REQUEST');
export const DATASET_VALIDATE_SUCCESS = Symbol('dataset/DATASET_VALIDATE_SUCCESS');
export const DATASET_VALIDATE_FAILURE = Symbol('dataset/DATASET_VALIDATE_FAILURE');

export const PREVIEW_DATASET_FETCH_REQUEST = Symbol('dataset/PREVIEW_DATASET_FETCH_REQUEST');
export const PREVIEW_DATASET_FETCH_SUCCESS = Symbol('dataset/PREVIEW_DATASET_FETCH_SUCCESS');
export const PREVIEW_DATASET_FETCH_FAILURE = Symbol('dataset/PREVIEW_DATASET_FETCH_FAILURE');

export const CLEAR_PREVIEW = Symbol('dataset/CLEAR_PREVIEW');
export const TOGGLE_ALLOWANCE_SAVE = Symbol('dataset/TOGGLE_ALLOWANCE_SAVE');
export const CHANGE_AMOUNT_PREVIEW_ROWS = Symbol('dataset/CHANGE_AMOUNT_PREVIEW_ROWS');

export const OPEN_PREVIEW = Symbol('dataset/OPEN_PREVIEW');
export const CLOSE_PREVIEW = Symbol('dataset/CLOSE_PREVIEW');
export const TOGGLE_PREVIEW = Symbol('dataset/TOGGLE_PREVIEW');
export const TOGGLE_VIEW_PREVIEW = Symbol('dataset/TOGGLE_VIEW_PREVIEW');
export const SET_QUEUE_TO_LOAD_PREVIEW = Symbol('dataset/SET_QUEUE_TO_LOAD_PREVIEW');
export const TOGGLE_LOAD_PREVIEW_BY_DEFAULT = Symbol('dataset/TOGGLE_LOAD_PREVIEW_BY_DEFAULT');

export const ADD_FIELD = Symbol('dataset/ADD_FIELD');
export const DUPLICATE_FIELD = Symbol('dataset/DUPLICATE_FIELD');
export const DELETE_FIELD = Symbol('dataset/DELETE_FIELD');
export const UPDATE_FIELD = Symbol('dataset/UPDATE_FIELD');
export const UPDATE_RLS = Symbol('dataset/UPDATE_RLS');

export const BATCH_DELETE_FIELDS = Symbol('dataset/BATCH_DELETE_FIELDS');
export const BATCH_UPDATE_FIELDS = Symbol('dataset/BATCH_UPDATE_FIELDS');

export const SET_IS_DATASET_CHANGED_FLAG = Symbol('dataset/SET_IS_DATASET_CHANGED_FLAG');
export const SET_INITIAL_SOURCES = Symbol('dataset/SET_INITIAL_SOURCES');

export const SOURCE_ADD = Symbol('dataset/ADD_SOURCE');
export const SOURCE_UPDATE = Symbol('dataset/UPDATE_SOURCE');
export const SOURCE_DELETE = Symbol('dataset/DELETE_SOURCE');
export const SOURCES_REFRESH = Symbol('dataset/SOURCES_REFRESH');
export const SOURCE_REPLACE = Symbol('dataset/SOURCE_REPLACE');
export const CONNECTION_REPLACE = Symbol('dataset/REPLACE_CONNECTION');

export const AVATAR_ADD = Symbol('dataset/ADD_SOURCE_AVATAR');
export const AVATAR_DELETE = Symbol('dataset/DELETE_SOURCE_AVATAR');

export const RELATION_ADD = Symbol('dataset/ADD_AVATAR_RELATION');
export const RELATION_UPDATE = Symbol('dataset/UPDATE_AVATAR_RELATION');
export const RELATION_DELETE = Symbol('dataset/DELETE_AVATAR_RELATION');

export const CLICK_CONNECTION = Symbol('dataset/CLICK_CONNECTION');
export const ADD_CONNECTION = Symbol('dataset/ADD_CONNECTION');
export const DELETE_CONNECTION = Symbol('dataset/DELETE_CONNECTION');

export const ADD_AVATAR_PROTOTYPES = Symbol('dataset/ADD_AVATAR_PROTOTYPES');
export const ADD_AVATAR_TEMPLATE = Symbol('dataset/ADD_AVATAR_TEMPLATE');

export const ADD_OBLIGATORY_FILTER = Symbol('dataset/ADD_OBLIGATORY_FILTER');
export const UPDATE_OBLIGATORY_FILTER = Symbol('dataset/UPDATE_OBLIGATORY_FILTER');
export const DELETE_OBLIGATORY_FILTER = Symbol('dataset/DELETE_OBLIGATORY_FILTER');

export const TOGGLE_FIELD_EDITOR_MODULE_LOADING = Symbol(
    'dataset/TOGGLE_FIELD_EDITOR_MODULE_LOADING',
);
export const SET_ASIDE_HEADER_WIDTH = Symbol('dataset/SET_ASIDE_HEADER_WIDTH');

export const TOGGLE_SOURCES_LOADER = Symbol('dataset/TOGGLE_SOURCES_LOADER');
export const SET_SOURCES_LOADING_ERROR = Symbol('dataset/SET_SOURCES_LOADING_ERROR');
export const SET_DATASET_REVISION_MISMATCH = Symbol('dataset/SET_DATASET_REVISION_MISMATCH');

export const EDITOR_SET_FILTER = Symbol('dataset/EDITOR_SET_FILTER');
export const EDITOR_SET_ITEMS_TO_DISPLAY = Symbol('dataset/EDITOR_SET_ITEMS_TO_DISPLAY');

export const RENAME_DATASET = Symbol('dataset/RENAME_DATASET');

export const SET_EDIT_HISTORY_STATE = Symbol('dataset/SET_EDIT_HISTORY_STATE');
