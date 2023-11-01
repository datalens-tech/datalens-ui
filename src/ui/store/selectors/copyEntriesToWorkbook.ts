import {createSelector} from 'reselect';
import type {DatalensGlobalState} from 'index';

export const selectGetEntry = (state: DatalensGlobalState) => state.copyEntriesToWorkbook.getEntry;

export const selectCopyEntryToWorkbook = (state: DatalensGlobalState) =>
    state.copyEntriesToWorkbook.copyEntriesToWorkbook;

export const selectIsLoadingCopyEntryToWorkbook = createSelector(
    [selectCopyEntryToWorkbook],
    (copying) => copying.isLoading,
);

export const selectGetRelations = (state: DatalensGlobalState) =>
    state.copyEntriesToWorkbook.getRelations;

export const selectIsLoadingTargetEntry = createSelector(
    [selectGetEntry],
    (getEntry) => getEntry.isLoading,
);

export const selectTargetEntry = createSelector([selectGetEntry], (getEntry) => getEntry.data);

export const selectTargetEntryError = createSelector(
    [selectGetEntry],
    (getEntry) => getEntry.error,
);

export const selectIsLoadingRelations = createSelector(
    [selectGetRelations],
    (getRelations) => getRelations.isLoading,
);

export const selectRelations = createSelector(
    [selectGetRelations],
    (getRelations) => getRelations.data,
);

export const selectRelationsError = createSelector(
    [selectGetRelations],
    (getRelations) => getRelations.error,
);
