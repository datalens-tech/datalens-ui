import type {DatalensGlobalState} from 'index';
import {createSelector} from 'reselect';

const selectGetWorkbook = (state: DatalensGlobalState) => state.workbooks.getWorkbook;

const selectGetWorkbookEntries = (state: DatalensGlobalState) => state.workbooks.getWorkbookEntries;
const selectGetWorkbookSharedEntries = (state: DatalensGlobalState) =>
    state.workbooks.getWorkbookSharedEntries;

const selectGetWorkbookBreadcrumbs = (state: DatalensGlobalState) =>
    state.workbooks.getWorkbookBreadcrumbs;

const selectCreateWorkbookEntry = (state: DatalensGlobalState) =>
    state.workbooks.createWorkbookEntry;

export const selectWorkbookItems = (state: DatalensGlobalState) => state.workbooks.items;
export const selectWorkbookSharedItems = (state: DatalensGlobalState) =>
    state.workbooks.sharedItems;

const selectRenameEntry = (state: DatalensGlobalState) => state.workbooks.renameEntry;

const selectDeleteEntry = (state: DatalensGlobalState) => state.workbooks.deleteEntry;

export const selectWorkbookPermissions = (state: DatalensGlobalState) =>
    state.workbooks.workbookPermissions;

export const selectWorkbookBreadcrumbs = (state: DatalensGlobalState) =>
    state.workbooks.workbookBreadcrumbs;

// Status of loading information about the workbook
export const selectWorkbookInfoIsLoading = createSelector(
    [selectGetWorkbook, selectGetWorkbookBreadcrumbs],
    (getWorkbook, getWorkbookBreadcrumbs) =>
        getWorkbook.isLoading || getWorkbookBreadcrumbs.isLoading,
);

// Page loading error
export const selectPageError = createSelector(
    [selectGetWorkbook],
    (getWorkbook) => getWorkbook.error,
);

// Information about the workbook
export const selectWorkbook = createSelector(
    [selectGetWorkbook],
    (getWorkbook) => getWorkbook.data,
);

export const selectCollectionId = createSelector(
    [selectGetWorkbook],
    (getWorkbook) => getWorkbook.data?.collectionId || null,
);

export const selectWorkbookId = createSelector(
    [selectGetWorkbook],
    (getWorkbook) => getWorkbook.data?.workbookId || null,
);

// Bread crumbs
export const selectBreadcrumbs = createSelector(
    [selectGetWorkbookBreadcrumbs],
    (getWorkbookBreadcrumbs) => getWorkbookBreadcrumbs.data,
);

export const selectBreadcrumbsError = createSelector(
    [selectGetWorkbookBreadcrumbs],
    (getWorkbookBreadcrumbs) => getWorkbookBreadcrumbs.error,
);

// Status (before)loading entities in the workbook
export const selectWorkbookEntriesIsLoading = createSelector(
    [selectGetWorkbookEntries],
    (getWorkbookEntries) => getWorkbookEntries.isLoading,
);

export const selectWorkbookSharedEntriesIsLoading = createSelector(
    [selectGetWorkbookSharedEntries],
    (getWorkbookSharedEntries) => getWorkbookSharedEntries.isLoading,
);

// Token for reloading subsequent entity pages
export const selectNextPageToken = createSelector(
    [selectGetWorkbookEntries],
    (getWorkbookEntries) => getWorkbookEntries.data?.nextPageToken,
);

export const selectSharedNextPageToken = createSelector(
    [selectGetWorkbookSharedEntries],
    (getWorkbookSharedEntries) => getWorkbookSharedEntries.data?.nextPageToken,
);

// Error (before) loading entities in the workbook
export const selectWorkbookEntriesError = createSelector(
    [selectGetWorkbookEntries],
    (getWorkbookEntries) => getWorkbookEntries.error,
);

export const selectWorkbookSharedEntriesError = createSelector(
    [selectGetWorkbookSharedEntries],
    (getWorkbookSharedEntries) => getWorkbookSharedEntries.error,
);

export const selectCreateWorkbookEntryType = createSelector(
    [selectCreateWorkbookEntry],
    (createWorkbookEntry) => createWorkbookEntry.type,
);

// Indication of the process of renaming an entry
export const selectRenameEntryIsLoading = createSelector(
    selectRenameEntry,
    (result) => result.isLoading,
);

// Indication of the entree removal process
export const selectDeleteEntryIsLoading = createSelector(
    selectDeleteEntry,
    (result) => result.isLoading,
);

// Entity Filters
export const selectWorkbookFilters = (state: DatalensGlobalState) => state.workbooks.filters;

// The name of the current workflow for navigation in entries
export const selectWorkbookName = (state: DatalensGlobalState, workbooksId: string) =>
    state.workbooks.workbooksNames[workbooksId] || workbooksId;

// The edit permission in the current workflow if it is the workbook
export const selectWorkbookEditPermission = createSelector(
    [selectWorkbookPermissions],
    (permissions) => (permissions ? permissions.update : true),
);

// The limited view rights in the current workflow if it is the workbook
// If there is no `view` rights but the entry is available then it is `limitedView` rights
export const selectWorkbookLimitedView = createSelector(
    [selectWorkbookPermissions],
    (permissions) => (permissions ? !permissions.view : false),
);
