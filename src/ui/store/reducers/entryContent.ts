import type {EntryContentAction} from '../actions/entryContent';
import {
    SET_ENTRY,
    SET_ENTRY_CURRENT_REVID,
    SET_REVISIONS,
    CLEAN_REVISIONS,
    SET_REVISIONS_LIST_MODE,
    SET_REVISIONS_MODE,
    TOGGLE_REVISIONS_MODE,
    REVISIONS_LOADING_STATUS,
    SET_IS_RENAME_WITHOUT_RELOAD,
} from '../actions/entryContent';
import type {GetRevisionsEntry} from '../../../shared/schema';
import {RevisionsListMode, RevisionsMode} from '../typings/entryContent';

export interface EntryContentState {
    revisionsMode: RevisionsMode;
    revisionsListMode: RevisionsListMode;
    revisions: Array<GetRevisionsEntry> | null;
    currentRevId: string | null;
    hasRevisionsNextPage: boolean;
    revisionsLoadingStatus: 'loading' | 'ready' | 'fail' | '';
    isRenameWithoutReload: boolean;
}

const getInitialEntryContentState = (): EntryContentState => ({
    revisionsMode: RevisionsMode.Closed,
    revisionsListMode: RevisionsListMode.Expanded,
    revisions: null,
    currentRevId: null,
    hasRevisionsNextPage: false,
    revisionsLoadingStatus: '',
    isRenameWithoutReload: false,
});

function entryContent(
    state: EntryContentState = getInitialEntryContentState(),
    action: EntryContentAction,
): EntryContentState {
    switch (action.type) {
        case SET_ENTRY: {
            const newEntryId = action.payload.entryId;
            const currentEntryRevisionsList = state.revisions;
            const needCleanRevisionsList =
                currentEntryRevisionsList?.length &&
                currentEntryRevisionsList[0].entryId !== newEntryId;
            const revisions = needCleanRevisionsList ? [] : state.revisions;

            return {
                ...state,
                ...action.payload,
                revisions,
                currentRevId: action.payload.revId,
            };
        }
        case SET_REVISIONS_MODE: {
            const newState = {
                ...state,
                revisionsMode: action.payload,
            };
            if (!action.payload) {
                newState.revisionsListMode = RevisionsListMode.Expanded;
            }
            return newState;
        }
        case SET_REVISIONS_LIST_MODE:
            return {
                ...state,
                revisionsListMode: action.payload,
            };
        case TOGGLE_REVISIONS_MODE: {
            const newRevisionsMode =
                state.revisionsMode === RevisionsMode.Opened
                    ? RevisionsMode.Closed
                    : RevisionsMode.Opened;
            const newState = {
                ...state,
                revisionsMode: newRevisionsMode,
            };

            return newState;
        }
        case SET_REVISIONS: {
            const {revisions, currentRevId, hasRevisionsNextPage} = action.payload;
            return {
                ...state,
                revisions: revisions,
                currentRevId: currentRevId,
                hasRevisionsNextPage,
            };
        }
        case CLEAN_REVISIONS: {
            return {
                ...state,
                revisions: [],
                hasRevisionsNextPage: false,
            };
        }
        case SET_ENTRY_CURRENT_REVID:
            return {
                ...state,
                currentRevId: action.payload,
            };

        case REVISIONS_LOADING_STATUS:
            return {
                ...state,
                revisionsLoadingStatus: action.payload,
            };

        case SET_IS_RENAME_WITHOUT_RELOAD: {
            return {
                ...state,
                isRenameWithoutReload: action.isRenameWithoutReload,
            };
        }

        default:
            return state;
    }
}

export default entryContent;
