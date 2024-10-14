import type {DatalensGlobalState} from 'ui';
import {RevisionsListMode, RevisionsMode} from '../typings/entryContent';
import {createSelector} from 'reselect';
import {groupRevisionsByDate} from '../../components/Revisions/helpers';
import type {RevisionEntry} from '../../components/Revisions/types';

export const selectEntryContent = (state: DatalensGlobalState) => state.entryContent || null;

export const selectEntryContentRevId = (state: DatalensGlobalState) =>
    state.entryContent?.revId || '';

export const selectEntryContentCurrentRevId = (state: DatalensGlobalState) =>
    state.entryContent?.currentRevId || '';

const selectRevisionsListMode = (state: DatalensGlobalState) =>
    state.entryContent?.revisionsListMode;

export const selectIsRevisionsListCollapsed = createSelector(
    selectRevisionsListMode,
    (mode?: RevisionsListMode) => mode === RevisionsListMode.Collapsed,
);

const selectRevisionsMode = (state: DatalensGlobalState) => state.entryContent?.revisionsMode;

export const selectIsRevisionsOpened = createSelector(
    selectRevisionsMode,
    (mode?: RevisionsMode) => mode === RevisionsMode.Opened,
);

export const selectIsEditMode = (state: DatalensGlobalState) => {
    const scope = state.entryContent?.scope;
    if (scope === 'dash') {
        return state.dash.mode;
    }

    return false;
};

const selectRevisions = (state: DatalensGlobalState): Array<RevisionEntry> =>
    state.entryContent?.revisions || [];

export const selectRevisionsItems = createSelector(selectRevisions, (items: Array<RevisionEntry>) =>
    groupRevisionsByDate(items || []),
);

export const selectLockToken = (state: DatalensGlobalState): string | null =>
    state.dash?.lockToken || null;

export const selectIsRenameWithoutReload = (state: DatalensGlobalState) =>
    state.entryContent.isRenameWithoutReload;
