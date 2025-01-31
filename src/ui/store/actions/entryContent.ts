import type {EntryGlobalState, RevisionsListMode} from '../typings/entryContent';
import {RevisionsMode} from '../typings/entryContent';
import type {GetEntryResponse, GetRevisionsEntry} from '../../../shared/schema';
import type {ThunkDispatch} from 'redux-thunk';
import type {DatalensGlobalState} from 'ui';
import {URL_QUERY} from 'ui';
import {getSdk} from '../../libs/schematic-sdk';
import {REVISIONS_LIST_PART_SIZE} from '../../components/Revisions/helpers';
import type {EntryContentState} from '../reducers/entryContent';
import history from '../../utils/history';
import {filterUsersIds} from '../../../shared';
import {getResolveUsersByIdsAction} from './usersByIds';

export function fetchEntryById(
    entryId: string,
    concurrentId: string | null,
    callback?: (entryItem: EntryGlobalState) => void,
) {
    return async (dispatch: EntryContentDispatch) => {
        const params = concurrentId ? {concurrentId} : {};
        let entry;

        try {
            entry = await getSdk().sdk.us.getEntry({entryId, includePermissionsInfo: true}, params);
        } catch (error: any) {
            if (getSdk().sdk.isCancel(error)) {
                entry = null;
            }
        }

        if (!entry) {
            return;
        }

        dispatch(setEntryContent(entry));

        if (typeof callback === 'function') {
            callback(entry);
        }
    };
}

export const SET_ENTRY = Symbol('entryContent/SET_ENTRY');
interface SetEntryAction {
    type: typeof SET_ENTRY;
    payload: EntryGlobalState;
}
export function setEntryContent(payload: SetEntryAction['payload']): SetEntryAction {
    return {
        type: SET_ENTRY,
        payload,
    };
}

export const SET_REVISIONS = Symbol('entryContent/SET_REVISIONS');
interface SetRevisionsAction {
    type: typeof SET_REVISIONS;
    payload: {
        revisions: Array<GetRevisionsEntry>;
        currentRevId: string | null;
        hasRevisionsNextPage: boolean;
    };
}
export function setRevisions(payload: SetRevisionsAction['payload']): SetRevisionsAction {
    return {
        type: SET_REVISIONS,
        payload,
    };
}

export function loadRevisions({
    entryId,
    page,
    revId,
    concurrentId,
}: {
    entryId: string;
    page: number;
    revId?: string | null;
    concurrentId?: string;
}) {
    return async (dispatch: EntryContentDispatch, getState: () => DatalensGlobalState) => {
        const entryContent = getState().entryContent;
        const {currentPageEntry} = getState().asideHeader;
        const {revisions, currentRevId} = entryContent;

        if (currentPageEntry?.entryId !== entryContent.entryId) {
            dispatch(cleanRevisions());
        }

        let hasNextPage = false;
        let entries: GetRevisionsEntry[] = [];

        try {
            const getRevisionsResponse = await getSdk().sdk.us.getRevisions(
                {
                    entryId,
                    pageSize: REVISIONS_LIST_PART_SIZE,
                    page,
                },
                {concurrentId},
            );
            hasNextPage = getRevisionsResponse.hasNextPage;
            entries = getRevisionsResponse.entries;
        } catch (error) {
            if (getSdk().sdk.isCancel(error)) {
                return;
            }
            throw error;
        }

        const loadedRevisions = revisions || [];
        const fetchedRevisions = [...entries];

        if (!hasNextPage) {
            const publishedId = entryContent.publishedId;
            const savedId = entryContent.savedId;
            const fetchedRevIdsSet = new Set(
                [...loadedRevisions, ...fetchedRevisions].map((item) => item.revId),
            );
            const revIdsSet: Set<string> = new Set();
            if (!fetchedRevIdsSet.has(savedId)) {
                revIdsSet.add(savedId);
            }
            if (publishedId && !fetchedRevIdsSet.has(publishedId)) {
                revIdsSet.add(publishedId);
            }
            if (revIdsSet.size > 0) {
                let extraEntries: GetRevisionsEntry[] = [];
                try {
                    const getRevisionsResponse = await getSdk().sdk.us.getRevisions(
                        {
                            entryId,
                            pageSize: REVISIONS_LIST_PART_SIZE,
                            page: 0,
                            revIds: Array.from(revIdsSet),
                        },
                        {concurrentId},
                    );
                    extraEntries = getRevisionsResponse.entries;
                } catch (error) {
                    if (getSdk().sdk.isCancel(error)) {
                        return;
                    }
                    throw error;
                }
                fetchedRevisions.push(...extraEntries);
            }
        }

        const ids = filterUsersIds(fetchedRevisions.map((item) => item.updatedBy));

        const resolveUsersByIds = getResolveUsersByIdsAction();
        const dispatchResolveUsersByIds = resolveUsersByIds(ids);
        if (dispatchResolveUsersByIds) {
            dispatch(dispatchResolveUsersByIds);
        }

        dispatch(
            setRevisions({
                revisions: [...loadedRevisions, ...fetchedRevisions],
                currentRevId: revId || currentRevId || '',
                hasRevisionsNextPage: hasNextPage,
            }),
        );
    };
}

export function reloadRevisions() {
    return async (dispatch: EntryContentDispatch, getState: () => DatalensGlobalState) => {
        await dispatch(revisionsLoadingStatus('loading'));
        const state = getState();
        const {entryContent} = state;
        if (entryContent.revisionsMode === RevisionsMode.Opened) {
            // reloading the list of versions
            await dispatch(
                loadRevisions({
                    entryId: entryContent.entryId,
                    page: 0,
                }),
            );
        }
        await dispatch(revisionsLoadingStatus('ready'));
    };
}

export const REVISIONS_LOADING_STATUS = Symbol('entryContent/REVISIONS_LOADING_STATUS');
interface RevisionsLoadingStatusAction {
    type: typeof REVISIONS_LOADING_STATUS;
    payload: EntryContentState['revisionsLoadingStatus'];
}

export function revisionsLoadingStatus(
    status: RevisionsLoadingStatusAction['payload'],
): RevisionsLoadingStatusAction {
    return {
        type: REVISIONS_LOADING_STATUS,
        payload: status,
    };
}

export const CLEAN_REVISIONS = Symbol('entryContent/CLEAN_REVISIONS');
interface CleanRevisionsAction {
    type: typeof CLEAN_REVISIONS;
}
export function cleanRevisions(): CleanRevisionsAction {
    return {
        type: CLEAN_REVISIONS,
    };
}

export const SET_REVISIONS_MODE = Symbol('entryContent/SET_REVISIONS_MODE');
interface SetRevisionsModeAction {
    type: typeof SET_REVISIONS_MODE;
    payload: RevisionsMode;
}
export function setRevisionsMode(
    payload: SetRevisionsModeAction['payload'],
): SetRevisionsModeAction {
    return {
        type: SET_REVISIONS_MODE,
        payload,
    };
}

export const SET_REVISIONS_LIST_MODE = Symbol('entryContent/SET_REVISIONS_LIST_MODE');
export interface SetRevisionsListModeAction {
    type: typeof SET_REVISIONS_LIST_MODE;
    payload: RevisionsListMode;
}
export function setRevisionsListMode(
    payload: SetRevisionsListModeAction['payload'],
): SetRevisionsListModeAction {
    return {
        type: SET_REVISIONS_LIST_MODE,
        payload,
    };
}

export const TOGGLE_REVISIONS_MODE = Symbol('entryContent/TOGGLE_REVISIONS_MODE');
interface ToggleRevisionsModeAction {
    type: typeof TOGGLE_REVISIONS_MODE;
}
export function toggleRevisionsMode(): ToggleRevisionsModeAction {
    return {
        type: TOGGLE_REVISIONS_MODE,
    };
}

export const SET_ENTRY_CURRENT_REVID = Symbol('entryContent/SET_ENTRY_CURRENT_REVID');
interface SetEntryCurrentRevIdAction {
    type: typeof SET_ENTRY_CURRENT_REVID;
    payload: string;
}
export function setEntryCurrentRevId(
    payload: SetEntryCurrentRevIdAction['payload'],
): SetEntryCurrentRevIdAction {
    return {
        type: SET_ENTRY_CURRENT_REVID,
        payload,
    };
}

export const SET_IS_RENAME_WITHOUT_RELOAD = Symbol('entryContent/SET_IS_RENAME_WITHOUT_RELOAD');
interface SetIsRenameAction {
    type: typeof SET_IS_RENAME_WITHOUT_RELOAD;
    isRenameWithoutReload: boolean;
}
export const setIsRenameWithoutReload = (isRenameWithoutReload: boolean): SetIsRenameAction => {
    return {
        type: SET_IS_RENAME_WITHOUT_RELOAD,
        isRenameWithoutReload,
    };
};

export function reloadRevisionsOnSave(needClose?: boolean) {
    return async (dispatch: EntryContentDispatch) => {
        if (needClose) {
            await dispatch(setRevisionsMode(RevisionsMode.Closed));
        }
        await dispatch(reloadRevisions());
    };
}

export function setChartsEntryContent(entry: GetEntryResponse) {
    return (dispatch: EntryContentDispatch) => {
        dispatch(setEntryContent(entry));

        const searchParams = new URLSearchParams(location.search);
        if (entry.publishedId) {
            if (entry.revId === entry.publishedId) {
                searchParams.delete(URL_QUERY.REV_ID);
            } else {
                searchParams.set(URL_QUERY.REV_ID, entry.revId);
            }
            history.push({
                ...location,
                search: `?${searchParams.toString()}`,
            });
        }
    };
}

export type EntryContentAction =
    | SetEntryAction
    | SetEntryCurrentRevIdAction
    | ToggleRevisionsModeAction
    | SetRevisionsModeAction
    | SetRevisionsListModeAction
    | SetRevisionsAction
    | CleanRevisionsAction
    | RevisionsLoadingStatusAction
    | SetIsRenameAction;

type EntryContentDispatch = ThunkDispatch<DatalensGlobalState, void, EntryContentAction>;
