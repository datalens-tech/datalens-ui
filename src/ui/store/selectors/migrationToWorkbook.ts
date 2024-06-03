import {createSelector} from 'reselect';
import type {DatalensGlobalState} from 'index';

export const selectGetEntry = (state: DatalensGlobalState) => state.migrationToWorkbook.getEntry;

export const selectMigrateEntriesToWorkbook = (state: DatalensGlobalState) =>
    state.migrationToWorkbook.migrateEntriesToWorkbook;

export const selectIsLoadingMigrateEntriesToWorkbook = createSelector(
    [selectMigrateEntriesToWorkbook],
    (migrate) => migrate.isLoading,
);

export const selectGetRelationsGraph = (state: DatalensGlobalState) =>
    state.migrationToWorkbook.getRelationsGraph;

export const selectGetRelations = (state: DatalensGlobalState) =>
    state.migrationToWorkbook.getRelations;

export const selectIsLoadingTargetEntry = createSelector(
    [selectGetEntry],
    (getEntry) => getEntry.isLoading,
);

export const selectTargetEntry = createSelector([selectGetEntry], (getEntry) => getEntry.data);

export const selectTargetEntryError = createSelector(
    [selectGetEntry],
    (getEntry) => getEntry.error,
);

export const selectIsLoadingRelationsGraph = createSelector(
    [selectGetRelationsGraph],
    (getRelationsGraph) => getRelationsGraph.isLoading,
);

export const selectRelationsGraph = createSelector(
    [selectGetRelationsGraph],
    (getRelationsGraph) => getRelationsGraph.data,
);

export const selectRelationsGraphError = createSelector(
    [selectGetRelationsGraph],
    (getRelationsGraph) => getRelationsGraph.error,
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
