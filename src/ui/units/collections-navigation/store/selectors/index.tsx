import {createSelector} from 'reselect';

import type {DatalensGlobalState} from '../../../../';

const selectGetCollectionBreadcrumbs = (state: DatalensGlobalState) =>
    state.collectionsNavigation.getCollectionBreadcrumbs;

export const selectCollectionBreadcrumbs = createSelector(
    [selectGetCollectionBreadcrumbs],
    (getCollectionBreadcrumbs) => getCollectionBreadcrumbs.data,
);

export const selectCollectionBreadcrumbsIsLoading = createSelector(
    [selectGetCollectionBreadcrumbs],
    (getCollectionBreadcrumbs) =>
        getCollectionBreadcrumbs.data === null || getCollectionBreadcrumbs.isLoading,
);

export const selectCollectionBreadcrumbsError = createSelector(
    [selectGetCollectionBreadcrumbs],
    (getCollectionBreadcrumbs) => getCollectionBreadcrumbs.error,
);
