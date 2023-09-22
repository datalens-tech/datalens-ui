import {createSelector} from 'reselect';
import {DatalensGlobalState} from 'index';

export const selectGetEntry = (state: DatalensGlobalState) => state.migrationToWorkbook.getEntry;

export const selectMigrateEntriesToWorkbook = (state: DatalensGlobalState) =>
    state.migrationToWorkbook.migrateEntriesToWorkbook;

export const selectIsLoadingMigrateEntriesToWorkbook = createSelector(
    [selectMigrateEntriesToWorkbook],
    (migrate) => migrate.isLoading,
);

export const selectGetRelationsGraph = (state: DatalensGlobalState) =>
    state.migrationToWorkbook.getRelationsGraph;

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
