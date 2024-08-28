import {createSelector} from 'reselect';

import type {DatalensGlobalState} from '../../../../';

const selectGetCollection = (state: DatalensGlobalState) => state.collections.getCollection;

const selectGetStructureItems = (state: DatalensGlobalState) => state.collections.getStructureItems;

const selectGetRootCollectionPermissions = (state: DatalensGlobalState) =>
    state.collections.getRootCollectionPermissions;

export const selectStructureItems = (state: DatalensGlobalState) => state.collections.items;

export const selectCollectionIsLoading = createSelector(
    [selectGetCollection],
    (getCollection) => getCollection.data === null || getCollection.isLoading,
);

export const selectCollection = createSelector(
    [selectGetCollection],
    (getCollection) => getCollection.data,
);

export const selectCollectionError = createSelector(
    [selectGetCollection],
    (getCollection) => getCollection.error,
);

export const selectStructureItemsIsLoading = createSelector(
    [selectGetStructureItems],
    (getStructureItems) => getStructureItems.data === null || getStructureItems.isLoading,
);

export const selectStructureItemsError = createSelector(
    [selectGetStructureItems],
    (getStructureItems) => getStructureItems.error,
);

export const selectStructureItemsNextPageToken = createSelector(
    [selectGetStructureItems],
    (getStructureItems) => getStructureItems.data?.nextPageToken,
);

export const selectRootCollectionPermissionsIsLoading = createSelector(
    [selectGetRootCollectionPermissions],
    (getRootCollectionPermissions) =>
        getRootCollectionPermissions.data === null || getRootCollectionPermissions.isLoading,
);

export const selectRootCollectionPermissions = createSelector(
    [selectGetRootCollectionPermissions],
    (getRootCollectionPermissions) => getRootCollectionPermissions.data,
);
