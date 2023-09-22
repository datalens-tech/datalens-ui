export const RESET_STATE = Symbol('collectionsStructure/RESET_STATE');

// Getting rights at the root of the structure
export const GET_ROOT_COLLECTION_PERMISSIONS_LOADING = Symbol(
    'collectionsStructure/GET_ROOT_COLLECTION_PERMISSIONS_LOADING',
);
export const GET_ROOT_COLLECTION_PERMISSIONS_SUCCESS = Symbol(
    'collectionsStructure/GET_ROOT_COLLECTION_PERMISSIONS_SUCCESS',
);
export const GET_ROOT_COLLECTION_PERMISSIONS_FAILED = Symbol(
    'collectionsStructure/GET_ROOT_COLLECTION_PERMISSIONS_FAILED',
);

// Reset the bread crumbs collection
export const RESET_COLLECTION_BREADCRUMBS = Symbol(
    'collectionsStructure/RESET_COLLECTION_BREADCRUMBS',
);

// Bread Crumbs collections
export const GET_COLLECTION_BREADCRUMBS_LOADING = Symbol(
    'collectionsStructure/GET_COLLECTION_BREADCRUMBS_LOADING',
);
export const GET_COLLECTION_BREADCRUMBS_SUCCESS = Symbol(
    'collectionsStructure/GET_COLLECTION_BREADCRUMBS_SUCCESS',
);
export const GET_COLLECTION_BREADCRUMBS_FAILED = Symbol(
    'collectionsStructure/GET_COLLECTION_BREADCRUMBS_FAILED',
);

// Information about the collection
export const GET_COLLECTION_LOADING = Symbol('collectionsStructure/GET_COLLECTION_LOADING');
export const GET_COLLECTION_SUCCESS = Symbol('collectionsStructure/GET_COLLECTION_SUCCESS');
export const GET_COLLECTION_FAILED = Symbol('collectionsStructure/GET_COLLECTION_FAILED');

// Resetting Collection contents
export const RESET_COLLECTION_CONTENT = Symbol('collectionsStructure/RESET_COLLECTION_CONTENT');

// Collection content
export const GET_COLLECTION_CONTENT_LOADING = Symbol(
    'collectionsStructure/GET_COLLECTION_CONTENT_LOADING',
);
export const GET_COLLECTION_CONTENT_SUCCESS = Symbol(
    'collectionsStructure/GET_COLLECTION_CONTENT_SUCCESS',
);
export const GET_COLLECTION_CONTENT_FAILED = Symbol(
    'collectionsStructure/GET_COLLECTION_CONTENT_FAILED',
);

// Creating a collection
export const CREATE_COLLECTION_LOADING = Symbol('collectionsStructure/CREATE_COLLECTION_LOADING');
export const CREATE_COLLECTION_SUCCESS = Symbol('collectionsStructure/CREATE_COLLECTION_SUCCESS');
export const CREATE_COLLECTION_FAILED = Symbol('collectionsStructure/CREATE_COLLECTION_FAILED');

export const CREATE_WORKBOOK_LOADING = Symbol('collectionsStructure/CREATE_WORKBOOK_LOADING');
export const CREATE_WORKBOOK_SUCCESS = Symbol('collectionsStructure/CREATE_WORKBOOK_SUCCESS');
export const CREATE_WORKBOOK_FAILED = Symbol('collectionsStructure/CREATE_WORKBOOK_FAILED');

// Moving a collection
export const MOVE_COLLECTION_LOADING = Symbol('collectionsStructure/MOVE_COLLECTION_LOADING');
export const MOVE_COLLECTION_SUCCESS = Symbol('collectionsStructure/MOVE_COLLECTION_SUCCESS');
export const MOVE_COLLECTION_FAILED = Symbol('collectionsStructure/MOVE_COLLECTION_FAILED');

// Moving the workbook
export const MOVE_WORKBOOK_LOADING = Symbol('collectionsStructure/MOVE_WORKBOOK_LOADING');
export const MOVE_WORKBOOK_SUCCESS = Symbol('collectionsStructure/MOVE_WORKBOOK_SUCCESS');
export const MOVE_WORKBOOK_FAILED = Symbol('collectionsStructure/MOVE_WORKBOOK_FAILED');

// Copying a workbook
export const COPY_WORKBOOK_LOADING = Symbol('collectionsStructure/COPY_WORKBOOK_LOADING');
export const COPY_WORKBOOK_SUCCESS = Symbol('collectionsStructure/COPY_WORKBOOK_SUCCESS');
export const COPY_WORKBOOK_FAILED = Symbol('collectionsStructure/COPY_WORKBOOK_FAILED');

// Workbook modification
export const UPDATE_WORKBOOK_LOADING = Symbol('collectionsStructure/UPDATE_WORKBOOK_LOADING');
export const UPDATE_WORKBOOK_SUCCESS = Symbol('collectionsStructure/UPDATE_WORKBOOK_SUCCESS');
export const UPDATE_WORKBOOK_FAILED = Symbol('collectionsStructure/UPDATE_WORKBOOK_FAILED');

// Collection modification
export const UPDATE_COLLECTION_LOADING = Symbol('collectionsStructure/UPDATE_COLLECTION_LOADING');
export const UPDATE_COLLECTION_SUCCESS = Symbol('collectionsStructure/UPDATE_COLLECTION_SUCCESS');
export const UPDATE_COLLECTION_FAILED = Symbol('collectionsStructure/UPDATE_COLLECTION_FAILED');
