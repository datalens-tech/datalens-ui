import {createSelector} from 'reselect';

import type {DatalensGlobalState} from '../../../../';

const selectGetCollection = (state: DatalensGlobalState) => state.collections.getCollection;

const selectGetCollectionContent = (state: DatalensGlobalState) =>
    state.collections.getCollectionContent;

const selectGetRootCollectionPermissions = (state: DatalensGlobalState) =>
    state.collections.getRootCollectionPermissions;

export const selectCollectionContentItems = (state: DatalensGlobalState) => state.collections.items;

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

export const selectCollectionContentIsLoading = createSelector(
    [selectGetCollectionContent],
    (getCollectionContent) => getCollectionContent.data === null || getCollectionContent.isLoading,
);

export const selectCollectionContentError = createSelector(
    [selectGetCollectionContent],
    (getCollectionContent) => getCollectionContent.error,
);

export const selectCollectionContentNextPageToken = createSelector(
    [selectGetCollectionContent],
    (getCollectionContent) => getCollectionContent.data?.nextPageToken,
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
