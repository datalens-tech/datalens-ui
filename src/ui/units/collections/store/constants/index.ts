// Getting the rights to create collections/workbooks in the root
export const GET_ROOT_COLLECTION_PERMISSIONS_LOADING = Symbol(
    'collections/GET_ROOT_COLLECTION_PERMISSIONS_LOADING',
);
export const GET_ROOT_COLLECTION_PERMISSIONS_SUCCESS = Symbol(
    'collections/GET_ROOT_COLLECTION_PERMISSIONS_SUCCESS',
);
export const GET_ROOT_COLLECTION_PERMISSIONS_FAILED = Symbol(
    'collections/GET_ROOT_COLLECTION_PERMISSIONS_FAILED',
);

// The start page of the collection content
export const GET_COLLECTION_CONTENT_LOADING = Symbol('collections/GET_COLLECTION_CONTENT_LOADING');
export const GET_COLLECTION_CONTENT_SUCCESS = Symbol('collections/GET_COLLECTION_CONTENT_SUCCESS');
export const GET_COLLECTION_CONTENT_FAILED = Symbol('collections/GET_COLLECTION_CONTENT_FAILED');

// Information about the collection
export const GET_COLLECTION_LOADING = Symbol('collections/GET_COLLECTION_LOADING');
export const GET_COLLECTION_SUCCESS = Symbol('collections/GET_COLLECTION_SUCCESS');
export const GET_COLLECTION_FAILED = Symbol('collections/GET_COLLECTION_FAILED');

// Bread Crumbs collections
export const GET_COLLECTION_BREADCRUMBS_LOADING = Symbol(
    'collections/GET_COLLECTION_BREADCRUMBS_LOADING',
);
export const GET_COLLECTION_BREADCRUMBS_SUCCESS = Symbol(
    'collections/GET_COLLECTION_BREADCRUMBS_SUCCESS',
);
export const GET_COLLECTION_BREADCRUMBS_FAILED = Symbol(
    'collections/GET_COLLECTION_BREADCRUMBS_FAILED',
);

export const RESET_COLLECTION_CONTENT = Symbol('collections/RESET_COLLECTION_CONTENT');
export const RESET_COLLECTION_INFO = Symbol('collections/RESET_COLLECTION_INFO');

export const DELETE_COLLECTION_IN_ITEMS = Symbol('collections/DELETE_COLLECTION_IN_ITEMS');
export const DELETE_WORKBOOK_IN_ITEMS = Symbol('collections/DELETE_WORKBOOK_IN_ITEMS');
