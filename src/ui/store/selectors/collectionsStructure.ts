import {createSelector} from 'reselect';
import type {DatalensGlobalState} from 'index';
import {getStatusFromOperation} from '../utils/collectionStructure';

export const selectGetRootCollectionPermissions = (state: DatalensGlobalState) =>
    state.collectionsStructure.getRootCollectionPermissions;

export const selectGetCollectionBreadcrumbs = (state: DatalensGlobalState) =>
    state.collectionsStructure.getCollectionBreadcrumbs;

export const selectGetCollection = (state: DatalensGlobalState) =>
    state.collectionsStructure.getCollection;

export const selectGetStructureItems = (state: DatalensGlobalState) =>
    state.collectionsStructure.getStructureItems;

export const selectStructureItems = (state: DatalensGlobalState) =>
    state.collectionsStructure.items;

export const selectCopyTemplate = (state: DatalensGlobalState) =>
    state.collectionsStructure.copyTemplate;

export const selectCreateCollection = (state: DatalensGlobalState) =>
    state.collectionsStructure.createCollection;

export const selectCreateWorkbook = (state: DatalensGlobalState) =>
    state.collectionsStructure.createWorkbook;

export const selectMoveCollection = (state: DatalensGlobalState) =>
    state.collectionsStructure.moveCollection;

export const selectMoveWorkbook = (state: DatalensGlobalState) =>
    state.collectionsStructure.moveWorkbook;

export const selectCopyWorkbook = (state: DatalensGlobalState) =>
    state.collectionsStructure.copyWorkbook;

const selectUpdateWorkbook = (state: DatalensGlobalState) =>
    state.collectionsStructure.updateWorkbook;

const selectUpdateCollection = (state: DatalensGlobalState) =>
    state.collectionsStructure.updateCollection;

const selectDeleteCollection = (state: DatalensGlobalState) =>
    state.collectionsStructure.deleteCollection;

const selectDeleteWorkbook = (state: DatalensGlobalState) =>
    state.collectionsStructure.deleteWorkbook;

const selectDeleteCollections = (state: DatalensGlobalState) =>
    state.collectionsStructure.deleteCollections;

const selectDeleteWorkbooks = (state: DatalensGlobalState) =>
    state.collectionsStructure.deleteWorkbooks;

const selectAddDemoWorkbook = (state: DatalensGlobalState) =>
    state.collectionsStructure.addDemoWorkbook;

const selectGetExportProgress = (state: DatalensGlobalState) =>
    state.collectionsStructure.getExportProgress;

const selectExportWorkbook = (state: DatalensGlobalState) =>
    state.collectionsStructure.exportWorkbook;

const selectGetExportResult = (state: DatalensGlobalState) =>
    state.collectionsStructure.getExportResult;

export const selectGetExportProgressData = createSelector(
    [selectGetExportProgress],
    (getExportProgress) => getExportProgress.data,
);

export const selectGetExportResultLoading = createSelector(
    [selectGetExportResult],
    (getExportResult) => getExportResult.isLoading,
);

export const selectExportError = createSelector(
    [selectExportWorkbook, selectGetExportProgress],
    (exportWorkbook, getExportProgress) => exportWorkbook.error || getExportProgress.error,
);

export const selectExportWorkbookStatus = createSelector(
    [selectExportWorkbook, selectGetExportProgress, selectGetExportResult],
    (exportWorkbook, getExportProgress, getExportResult) =>
        getStatusFromOperation({
            initialOperation: exportWorkbook,
            progessOperation: getExportProgress,
            resultOperation: getExportResult,
        }),
);

const selectImportWorkbook = (state: DatalensGlobalState) =>
    state.collectionsStructure.importWorkbook;

const selectGetImportProgress = (state: DatalensGlobalState) =>
    state.collectionsStructure.getImportProgress;

export const selectImportWorkbookData = createSelector(
    [selectGetImportProgress],
    (getImportProgress) => getImportProgress.data,
);

export const selectGetImportProgressData = createSelector(
    [selectGetImportProgress],
    (getImportProgress) => getImportProgress.data,
);

export const selectImportError = createSelector(
    [selectImportWorkbook, selectGetImportProgress],
    (importWorkbook, getImportProgress) => importWorkbook.error || getImportProgress.error,
);

export const selectImportWorkbookStatus = createSelector(
    [selectImportWorkbook, selectGetImportProgress],
    (importWorkbook, getImportProgress) =>
        getStatusFromOperation({
            initialOperation: importWorkbook,
            progessOperation: getImportProgress,
        }),
);

export const selectExportData = createSelector(
    [selectExportWorkbook],
    (exportWorkbook) => exportWorkbook.data,
);

// Export result data
export const selectExportResultData = createSelector(
    [selectGetExportResult],
    (getExportResult) => getExportResult.data,
);

// Export result loading state
export const selectExportResultIsLoading = createSelector(
    [selectGetExportResult],
    (getExportResult) => getExportResult.isLoading,
);

// Rights at the root of the structure
export const selectRootPermissionsData = createSelector(
    [selectGetRootCollectionPermissions],
    (permissions) => permissions.data,
);

// Loading status of collection information
export const selectCollectionIsLoading = createSelector(
    [selectGetCollection],
    (getCollection) => getCollection.isLoading,
);

// Information about the collection
export const selectCollectionData = createSelector(
    [selectGetCollection],
    (getCollection) => getCollection.data,
);

// Loading status of the breadcrumbs collection
export const selectBreadcrumbsIsLoading = createSelector(
    [selectGetCollectionBreadcrumbs],
    (getCollectionBreadcrumbs) => getCollectionBreadcrumbs.isLoading,
);

// The result of loading the bread crumbs of the collection
export const selectBreadcrumbs = createSelector(
    [selectGetCollectionBreadcrumbs],
    (getCollectionBreadcrumbs) => getCollectionBreadcrumbs.data,
);

// Status of loading information about the contents of the collection
export const selectStructureItemsIsLoading = createSelector(
    [selectGetStructureItems],
    (getStructureItems) => getStructureItems.isLoading,
);

// Error status of loading information about the contents of the collection
export const selectStructureItemsError = createSelector(
    [selectGetStructureItems],
    (getStructureItems) => getStructureItems.error,
);

// Tokens for reloading subsequent content pages
export const selectNextPageToken = createSelector(
    [selectGetStructureItems],
    (content) => content.data?.nextPageToken || null,
);

export const selectCopyTemplateIsLoading = createSelector(
    [selectCopyTemplate],
    (copyTemplate) => copyTemplate.isLoading,
);

// Status of the collection creation request
export const selectCreateCollectionIsLoading = createSelector(
    [selectCreateCollection],
    (createCollection) => createCollection.isLoading,
);

export const selectCreateWorkbookIsLoading = createSelector(
    [selectCreateWorkbook],
    (createWorkbook) => createWorkbook.isLoading,
);

// Status of the request to move the collection / workbook
export const selectMoveIsLoading = createSelector(
    [selectMoveCollection, selectMoveWorkbook],
    (moveCollection, moveWorkbook) => moveCollection.isLoading || moveWorkbook.isLoading,
);

// Status of the workbook copy request
export const selectCopyWorkbookIsLoading = createSelector(
    [selectCopyWorkbook],
    (copyWorkbook) => copyWorkbook.isLoading,
);

// Indication of the process of changing the collection
export const selectUpdateCollectionIsLoading = createSelector(
    selectUpdateCollection,
    (result) => result.isLoading,
);

// Indication of the process of changing the workbook
export const selectUpdateWorkbookIsLoading = createSelector(
    selectUpdateWorkbook,
    (result) => result.isLoading,
);

// Indication of the collections and workbooks deletion process
export const selectDeleteIsLoading = createSelector(
    [selectDeleteCollections, selectDeleteWorkbooks],
    (deleteCollections, deleteWorkbooks) =>
        deleteCollections.isLoading || deleteWorkbooks.isLoading,
);

// Indication of the collection deletion process
export const selectDeleteCollectionIsLoading = createSelector(
    selectDeleteCollection,
    (result) => result.isLoading,
);

// Indication of the process of changing the workbook
export const selectDeleteWorkbookIsLoading = createSelector(
    selectDeleteWorkbook,
    (result) => result.isLoading,
);

// Indication of the process of adding a demo workbook
export const selectAddDemoWorkbookIsLoading = createSelector(
    selectAddDemoWorkbook,
    (result) => result.isLoading,
);
