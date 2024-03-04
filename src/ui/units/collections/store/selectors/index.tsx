import {DatalensGlobalState} from 'index';
import {createSelector} from 'reselect';

const selectGetRootCollectionPermissions = (state: DatalensGlobalState) =>
    state.collections.getRootCollectionPermissions;

const selectGetCollectionContent = (state: DatalensGlobalState) =>
    state.collections.getCollectionContent;

export const selectCollectionContentItems = (state: DatalensGlobalState) => state.collections.items;

const selectGetCollection = (state: DatalensGlobalState) => state.collections.getCollection;

const selectGetCollectionBreadcrumbs = (state: DatalensGlobalState) =>
    state.collections.getCollectionBreadcrumbs;

// Rights to create collections/workbooks in the root
export const selectRootPermissionsIsLoading = createSelector(
    [selectGetRootCollectionPermissions],
    (permissions) => permissions.data === null || permissions.isLoading,
);
export const selectRootPermissionsData = createSelector(
    [selectGetRootCollectionPermissions],
    (permissions) => permissions.data,
);

// Content loading status
export const selectContentIsLoading = createSelector(
    [selectGetCollectionContent],
    (content) => content.data === null || content.isLoading,
);

// Content loading error
export const selectContentError = createSelector(
    [selectGetCollectionContent],
    (content) => content.error,
);

// Tokens for reloading subsequent content pages
export const selectNextPageTokens = createSelector([selectGetCollectionContent], (content) => ({
    collectionsNextPageToken: content.data?.collectionsNextPageToken,
    workbooksNextPageToken: content.data?.workbooksNextPageToken,
}));

// Loading status of collection information
export const selectCollectionInfoIsLoading = createSelector(
    [selectGetCollection],
    (collection) => collection.data === null || collection.isLoading,
);

// Page loading error
export const selectPageError = createSelector(
    [selectGetCollection],
    (collection) => collection.error,
);

// Information about the collection
export const selectCollection = createSelector(
    [selectGetCollection],
    (getCollection) => getCollection.data,
);

// Breadcrumbs
export const selectBreadcrumbs = createSelector(
    [selectGetCollectionBreadcrumbs],
    (getCollectionBreadcrumbs) => getCollectionBreadcrumbs.data,
);

export const selectBreadcrumbsIsLoading = createSelector(
    [selectGetCollectionBreadcrumbs],
    (getCollectionBreadcrumbs) =>
        getCollectionBreadcrumbs.data === null || getCollectionBreadcrumbs.isLoading,
);

export const selectBreadcrumbsError = createSelector(
    [selectGetCollectionBreadcrumbs],
    (getCollectionBreadcrumbs) => getCollectionBreadcrumbs.error,
);
