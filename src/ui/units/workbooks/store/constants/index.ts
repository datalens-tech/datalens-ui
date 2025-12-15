// Information about the workbook
export const GET_WORKBOOK_LOADING = Symbol('workbooks/GET_WORKBOOK_LOADING');
export const GET_WORKBOOK_SUCCESS = Symbol('workbooks/GET_WORKBOOK_SUCCESS');
export const GET_WORKBOOK_FAILED = Symbol('workbooks/GET_WORKBOOK_FAILED');

// Information about entities in the workbook
export const GET_WORKBOOK_ENTRIES_LOADING = Symbol('workbooks/GET_WORKBOOK_ENTRIES_LOADING');
export const GET_WORKBOOK_ENTRIES_SUCCESS = Symbol('workbooks/GET_WORKBOOK_ENTRIES_SUCCESS');
export const GET_WORKBOOK_ENTRIES_FAILED = Symbol('workbooks/GET_WORKBOOK_ENTRIES_FAILED');

export const GET_WORKBOOK_SHARED_ENTRIES_LOADING = Symbol(
    'workbooks/GET_WORKBOOK_SHARED_ENTRIES_LOADING',
);
export const GET_WORKBOOK_SHARED_ENTRIES_SUCCESS = Symbol(
    'workbooks/GET_WORKBOOK_SHARED_ENTRIES_SUCCESS',
);
export const GET_WORKBOOK_SHARED_ENTRIES_FAILED = Symbol(
    'workbooks/GET_WORKBOOK_SHARED_ENTRIES_FAILED',
);

export const BIND_SHARED_ENTRY_TO_WORKBOOK_LOADING = Symbol(
    'workbooks/BIND_SHARED_ENTRY_TO_WORKBOOK_LOADING',
);
export const BIND_SHARED_ENTRY_TO_WORKBOOK_SUCCESS = Symbol(
    'workbooks/BIND_SHARED_ENTRY_TO_WORKBOOK_SUCCESS',
);
export const BIND_SHARED_ENTRY_TO_WORKBOOK_FAILED = Symbol(
    'workbooks/BIND_SHARED_ENTRY_TO_WORKBOOK_FAILED',
);

export const GET_ALL_WORKBOOK_ENTRIES_SEPARATELY_SUCCESS = Symbol(
    'workbooks/GET_ALL_WORKBOOK_ENTRIES_SEPARATELY_SUCCESS',
);

export const RESET_WORKBOOK_ENTRIES = Symbol('workbooks/RESET_WORKBOOK_ENTRIES');
export const RESET_WORKBOOK_SHARED_ENTRIES = Symbol('workbooks/RESET_WORKBOOK_SHARED_ENTRIES');

export const RESET_WORKBOOK_ENTRIES_BY_SCOPE = Symbol('workbooks/RESET_WORKBOOK_ENTRIES_BY_SCOPE');

// Bread crumbs of the workbook
export const GET_WORKBOOK_BREADCRUMBS_LOADING = Symbol(
    'workbooks/GET_WORKBOOK_BREADCRUMBS_LOADING',
);
export const GET_WORKBOOK_BREADCRUMBS_SUCCESS = Symbol(
    'workbooks/GET_WORKBOOK_BREADCRUMBS_SUCCESS',
);
export const GET_WORKBOOK_BREADCRUMBS_FAILED = Symbol('workbooks/GET_WORKBOOK_BREADCRUMBS_FAILED');

// Information about which entity to create in the workbook
export const SET_CREATE_WORKBOOK_ENTRY_TYPE = Symbol('workbooks/SET_CREATE_WORKBOOK_ENTRY_TYPE');
export const RESET_CREATE_WORKBOOK_ENTRY_TYPE = Symbol(
    'workbooks/RESET_CREATE_WORKBOOK_ENTRY_TYPE',
);

// Renaming the entry
export const RENAME_ENTRY_LOADING = Symbol('workbooks/RENAME_ENTRY_LOADING');
export const RENAME_ENTRY_SUCCESS = Symbol('workbooks/RENAME_ENTRY_SUCCESS');
export const RENAME_ENTRY_FAILED = Symbol('workbooks/RENAME_ENTRY_FAILED');
export const RENAME_ENTRY_INLINE = Symbol('workbooks/RENAME_ENTRY_INLINE');

// Deleting an entry
export const DELETE_ENTRY_LOADING = Symbol('workbooks/DELETE_ENTRY_LOADING');
export const DELETE_ENTRY_SUCCESS = Symbol('workbooks/DELETE_ENTRY_SUCCESS');
export const DELETE_ENTRY_FAILED = Symbol('workbooks/DELETE_ENTRY_FAILED');
export const DELETE_ENTRY_INLINE = Symbol('workbooks/DELETE_ENTRY_INLINE');

// Changing favorite an entry
export const CHANGE_FAVORITE_ENTRY_LOADING = Symbol('workbooks/CHANGE_FAVORITE_ENTRY_LOADING');
export const CHANGE_FAVORITE_ENTRY_SUCCESS = Symbol('workbooks/CHANGE_FAVORITE_ENTRY_SUCCESS');
export const CHANGE_FAVORITE_ENTRY_FAILED = Symbol('workbooks/CHANGE_FAVORITE_ENTRY_FAILED');
export const CHANGE_FAVORITE_ENTRY_INLINE = Symbol('workbooks/CHANGE_FAVORITE_ENTRY_INLINE');

// Resetting the entire state of workbooks to initialState
export const RESET_WORKBOOK_STATE = Symbol('workbooks/RESET_WORKBOOK_STATE');

// Entity filters in the workbook
export const CHANGE_FILTERS = Symbol('workbooks/CHANGE_FILTERS');

// Add the name of the current workflow for navigation in entries
export const ADD_WORKBOOK_INFO = Symbol('workbooks/ADD_WORKBOOK_INFO');

// Add breadcrumbs for collection entries
export const ADD_COLLECTION_BREADCRUMBS = Symbol('workbooks/ADD_COLLECTION_BREADCRUMBS');

// Reset permissions of the current workflow
export const RESET_WORKBOOK_PERMISSIONS = Symbol('workbooks/RESET_WORKBOOK_PERMISSIONS');

export const SET_WORKBOOK = Symbol('workbooks/SET_WORKBOOK');
