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
export const RESET_STRUCTURE_ITEMS = Symbol('collectionsStructure/RESET_STRUCTURE_ITEMS');

// Collection content
export const GET_STRUCTURE_ITEMS_LOADING = Symbol(
    'collectionsStructure/GET_STRUCTURE_ITEMS_LOADING',
);
export const GET_STRUCTURE_ITEMS_SUCCESS = Symbol(
    'collectionsStructure/GET_STRUCTURE_ITEMS_SUCCESS',
);
export const GET_STRUCTURE_ITEMS_FAILED = Symbol('collectionsStructure/GET_STRUCTURE_ITEMS_FAILED');

// Copy template
export const COPY_TEMPLATE_LOADING = Symbol('collectionsStructure/COPY_TEMPLATE_LOADING');
export const COPY_TEMPLATE_SUCCESS = Symbol('collectionsStructure/COPY_TEMPLATE_SUCCESS');
export const COPY_TEMPLATE_FAILED = Symbol('collectionsStructure/COPY_TEMPLATE_FAILED');

// Creating a collection
export const CREATE_COLLECTION_LOADING = Symbol('collectionsStructure/CREATE_COLLECTION_LOADING');
export const CREATE_COLLECTION_SUCCESS = Symbol('collectionsStructure/CREATE_COLLECTION_SUCCESS');
export const CREATE_COLLECTION_FAILED = Symbol('collectionsStructure/CREATE_COLLECTION_FAILED');

export const CREATE_WORKBOOK_LOADING = Symbol('collectionsStructure/CREATE_WORKBOOK_LOADING');
export const CREATE_WORKBOOK_SUCCESS = Symbol('collectionsStructure/CREATE_WORKBOOK_SUCCESS');
export const CREATE_WORKBOOK_FAILED = Symbol('collectionsStructure/CREATE_WORKBOOK_FAILED');

// Delete collections
export const DELETE_COLLECTIONS_LOADING = Symbol('collectionsStructure/DELETE_COLLECTIONS_LOADING');
export const DELETE_COLLECTIONS_SUCCESS = Symbol('collectionsStructure/DELETE_COLLECTIONS_SUCCESS');
export const DELETE_COLLECTIONS_FAILED = Symbol('collectionsStructure/DELETE_COLLECTIONS_FAILED');

// Delete workbooks
export const DELETE_WORKBOOKS_LOADING = Symbol('collectionsStructure/DELETE_WORKBOOKS_LOADING');
export const DELETE_WORKBOOKS_SUCCESS = Symbol('collectionsStructure/DELETE_WORKBOOKS_SUCCESS');
export const DELETE_WORKBOOKS_FAILED = Symbol('collectionsStructure/DELETE_WORKBOOKS_FAILED');

// Moving collections
export const MOVE_COLLECTIONS_LOADING = Symbol('collectionsStructure/MOVE_COLLECTIONS_LOADING');
export const MOVE_COLLECTIONS_SUCCESS = Symbol('collectionsStructure/MOVE_COLLECTIONS_SUCCESS');
export const MOVE_COLLECTIONS_FAILED = Symbol('collectionsStructure/MOVE_COLLECTIONS_FAILED');

// Moving a collection
export const MOVE_COLLECTION_LOADING = Symbol('collectionsStructure/MOVE_COLLECTION_LOADING');
export const MOVE_COLLECTION_SUCCESS = Symbol('collectionsStructure/MOVE_COLLECTION_SUCCESS');
export const MOVE_COLLECTION_FAILED = Symbol('collectionsStructure/MOVE_COLLECTION_FAILED');

// Moving workbooks
export const MOVE_WORKBOOKS_LOADING = Symbol('collectionsStructure/MOVE_WORKBOOKS_LOADING');
export const MOVE_WORKBOOKS_SUCCESS = Symbol('collectionsStructure/MOVE_WORKBOOKS_SUCCESS');
export const MOVE_WORKBOOKS_FAILED = Symbol('collectionsStructure/MOVE_WORKBOOKS_FAILED');

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

// Deleting a collection
export const DELETE_COLLECTION_LOADING = Symbol('collectionsStructure/DELETE_COLLECTION_LOADING');
export const DELETE_COLLECTION_SUCCESS = Symbol('collectionsStructure/DELETE_COLLECTION_SUCCESS');
export const DELETE_COLLECTION_FAILED = Symbol('collectionsStructure/DELETE_COLLECTION_FAILED');

// Deleting a workbook
export const DELETE_WORKBOOK_LOADING = Symbol('collectionsStructure/DELETE_WORKBOOK_LOADING');
export const DELETE_WORKBOOK_SUCCESS = Symbol('collectionsStructure/DELETE_WORKBOOK_SUCCESS');
export const DELETE_WORKBOOK_FAILED = Symbol('collectionsStructure/DELETE_WORKBOOK_FAILED');

// Adding a demo workbook
export const ADD_DEMO_WORKBOOK_LOADING = Symbol('collections/ADD_DEMO_WORKBOOK_LOADING');
export const ADD_DEMO_WORKBOOK_SUCCESS = Symbol('collections/ADD_DEMO_WORKBOOK_SUCCESS');
export const ADD_DEMO_WORKBOOK_FAILED = Symbol('collections/ADD_DEMO_WORKBOOK_FAILED');

// Exporting a workbook as a file
export const EXPORT_WORKBOOK_LOADING = Symbol('collections/EXPORT_WORKBOOK_LOADING');
export const EXPORT_WORKBOOK_SUCCESS = Symbol('collections/EXPORT_WORKBOOK_SUCCESS');
export const EXPORT_WORKBOOK_FAILED = Symbol('collections/EXPORT_WORKBOOK_FAILED');
export const EXPORT_WORKBOOK_PROGRESS = Symbol('collections/EXPORT_WORKBOOK_PROGRESS');
export const RESET_EXPORT_WORKBOOK = Symbol('collections/RESET_EXPORT_WORKBOOK');

// Creating workbook and importing file
export const IMPORT_WORKBOOK_LOADING = Symbol('collections/IMPORT_WORKBOOK_LOADING');
export const IMPORT_WORKBOOK_SUCCESS = Symbol('collections/IMPORT_WORKBOOK_SUCCESS');
export const IMPORT_WORKBOOK_FAILED = Symbol('collections/IMPORT_WORKBOOK_FAILED');
export const RESET_IMPORT_WORKBOOK = Symbol('collections/RESET_IMPORT_WORKBOOK');

// Getting progress of workbook importing
export const GET_IMPORT_PROGRESS_LOADING = Symbol('collections/GET_IMPORT_PROGRESS_LOADING');
export const GET_IMPORT_PROGRESS_SUCCESS = Symbol('collections/GET_IMPORT_PROGRESS_SUCCESS');
export const RESET_IMPORT_PROGRESS = Symbol('collections/RESET_IMPORT_PROGRESS');
