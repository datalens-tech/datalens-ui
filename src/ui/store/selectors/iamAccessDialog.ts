import {createSelector} from 'reselect';
import type {DatalensGlobalState} from 'index';

const selectListAccessBindings = (state: DatalensGlobalState) =>
    state.iamAccessDialog.listAccessBindings;

export const selectItemsAccessBindings = (state: DatalensGlobalState) =>
    state.iamAccessDialog.itemsAccessBindings;

const selectUpdateAccessBindings = (state: DatalensGlobalState) =>
    state.iamAccessDialog.updateAccessBindings;

const selectGetCollectionBreadcrumbs = (state: DatalensGlobalState) =>
    state.iamAccessDialog.getCollectionBreadcrumbs;

const selectGetClaims = (state: DatalensGlobalState) => state.iamAccessDialog.getClaims;

export const selectListAccessBindingsIsLoading = createSelector(
    [selectListAccessBindings],
    (listAccessBindings) => listAccessBindings.isLoading,
);

export const selectGetCollectionBreadcrumbsIsLoading = createSelector(
    [selectGetCollectionBreadcrumbs],
    (getCollectionBreadcrumbs) => getCollectionBreadcrumbs.isLoading,
);

export const selectGetClaimsIsLoading = createSelector(
    [selectGetClaims],
    (getClaims) => getClaims.isLoading,
);

export const selectListAccessBindingsData = createSelector(
    [selectListAccessBindings],
    (listAccessBindings) => listAccessBindings.data,
);

export const selectGetCollectionBreadcrumbsData = createSelector(
    [selectGetCollectionBreadcrumbs],
    (getCollectionBreadcrumbs) => getCollectionBreadcrumbs.data,
);

export const selectGetCollectionBreadcrumbsError = createSelector(
    [selectGetCollectionBreadcrumbs],
    (getCollectionBreadcrumbs) => getCollectionBreadcrumbs.error,
);

export const selectGetClaimsData = createSelector([selectGetClaims], (getClaims) => getClaims.data);

export const selectMembersItems = (state: DatalensGlobalState) =>
    state.iamAccessDialog.itemsGetClaims;

export const selectMembers = createSelector(
    [selectGetClaimsData],
    (getClaimsData) => getClaimsData?.subjectDetails,
);

export const selectListAccessBindingsError = createSelector(
    [selectListAccessBindings],
    (listAccessBindings) => listAccessBindings.error,
);

export const selectGetClaimsError = createSelector(
    [selectGetClaims],
    (getClaims) => getClaims.error,
);

export const selectUpdateAccessBindingsIsLoading = createSelector(
    [selectUpdateAccessBindings],
    (updateAccessBindings) => updateAccessBindings.isLoading,
);
