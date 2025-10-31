import {omit, uniqBy} from 'lodash';

import {
    DL_COMPONENT_HEADER,
    DlComponentHeader,
    TIMEOUT_60_SEC,
    TIMEOUT_90_SEC,
    WORKBOOK_ID_HEADER,
} from '../../../../constants';
import {getEntryNameByKey, normalizeDestination} from '../../../../modules';
import {Feature} from '../../../../types/feature';
import {createAction} from '../../../gateway-utils';
import {filterUrlFragment} from '../../../utils';
import type {
    CopyEntriesToWorkbookArgs,
    CopyEntriesToWorkbookResponse,
    CopyEntryArgs,
    CopyEntryResponse,
    CopyWorkbookEntryArgs,
    CopyWorkbookEntryResponse,
    CreateFolderArgs,
    CreateFolderResponse,
    DeleteUSEntryArgs,
    DeleteUSEntryResponse,
    GetEntriesAnnotationArgs,
    GetEntriesAnnotationResponse,
    GetEntriesByKeyPatternArgs,
    GetEntriesByKeyPatternResponse,
    GetEntryArgs,
    GetEntryByKeyArgs,
    GetEntryByKeyResponse,
    GetEntryMetaArgs,
    GetEntryMetaResponse,
    GetEntryResponse,
    GetRelationsArgs,
    GetRelationsGraphArgs,
    GetRelationsGraphResponse,
    GetRelationsOutput,
    GetRelationsResponse,
    GetRevisionsArgs,
    GetRevisionsOutput,
    GetRevisionsResponse,
    MoveEntryArgs,
    MoveEntryResponse,
    RenameEntryArgs,
    RenameEntryResponse,
    SwitchPublicationStatusArgs,
    SwitchPublicationStatusResponse,
} from '../../types';

import {getEntries} from './get-entries';
import {listDirectory} from './list-directory';

const PATH_PREFIX = '/v1';
const PATH_PREFIX_V2 = '/v2';
const PRIVATE_PATH_PREFIX = '/private';

export const entriesActions = {
    listDirectory,
    getEntries,
    getEntry: createAction<GetEntryResponse, GetEntryArgs>({
        method: 'GET',
        path: ({entryId}) => `${PATH_PREFIX}/entries/${filterUrlFragment(entryId)}`,
        params: (
            {
                entryId: _entryId,
                workbookId,
                includeDlComponentUiData,
                includeFavorite = true,
                ...query
            },
            headers,
        ) => ({
            query: {
                ...query,
                includeFavorite,
            },
            headers: {
                ...headers,
                ...(includeDlComponentUiData ? {[DL_COMPONENT_HEADER]: DlComponentHeader.UI} : {}),
                ...(workbookId ? {[WORKBOOK_ID_HEADER]: workbookId} : {}),
            },
        }),
    }),
    getEntryByKey: createAction<GetEntryByKeyResponse, GetEntryByKeyArgs>({
        method: 'GET',
        path: () => `${PATH_PREFIX}/entriesByKey`,
        params: (query, headers) => ({query, headers}),
    }),
    getEntryMeta: createAction<GetEntryMetaResponse, GetEntryMetaArgs>({
        method: 'GET',
        path: ({entryId}) => `${PATH_PREFIX}/entries/${filterUrlFragment(entryId)}/meta`,
        params: (_, headers) => ({headers}),
    }),
    getRevisions: createAction<GetRevisionsOutput, GetRevisionsArgs, GetRevisionsResponse>({
        method: 'GET',
        path: ({entryId}) => `${PATH_PREFIX}/entries/${filterUrlFragment(entryId)}/revisions`,
        params: (args, headers, {ctx}) => {
            let updatedAfter;
            const isEnabledServerFeature = ctx.get('isEnabledServerFeature');
            if (!isEnabledServerFeature(Feature.RevisionsListNoLimit) && !args.revIds) {
                const date = new Date();
                date.setMonth(date.getMonth() - 3);
                updatedAfter = date.toISOString();
            }
            return {
                query: {
                    ...omit(args, 'entryId'),
                    updatedAfter,
                },
                headers,
            };
        },
        transformResponseData: (data) => ({
            hasNextPage: Boolean(data.nextPageToken),
            entries: data.entries,
        }),
    }),
    getRelations: createAction<GetRelationsOutput, GetRelationsArgs, GetRelationsResponse>({
        method: 'GET',
        path: ({entryId}) => `${PATH_PREFIX}/entries/${filterUrlFragment(entryId)}/relations`,
        params: (args, headers) => ({
            query: omit(args, 'entryId', 'excludeUnregistredDlsEntries'),
            headers,
        }),
        transformResponseData: (data, {args, ctx}) => {
            let uniqRelations = uniqBy(
                data.map((relationEntry) => ({
                    ...relationEntry,
                    name: getEntryNameByKey({key: relationEntry.key}),
                })),
                (relationEntry) => relationEntry.entryId,
            );
            if (args.excludeUnregistredDlsEntries) {
                const isEnabledServerFeature = ctx.get('isEnabledServerFeature');
                if (isEnabledServerFeature(Feature.UseYqlFolderKey)) {
                    const yqlFolderKey = 'yql/charts/';
                    uniqRelations = uniqRelations.filter(
                        ({key}) => !key.toLowerCase().startsWith(yqlFolderKey),
                    );
                }
            }
            return uniqRelations;
        },
    }),
    moveEntry: createAction<MoveEntryResponse, MoveEntryArgs>({
        method: 'POST',
        path: ({entryId}) => `${PATH_PREFIX}/entries/${filterUrlFragment(entryId)}/move`,
        params: (args, headers) => {
            const body: Omit<MoveEntryArgs, 'entryId'> = {
                destination: normalizeDestination(args.destination),
            };
            if (args.name) {
                body.name = args.name;
            }
            return {body, headers};
        },
        timeout: TIMEOUT_60_SEC,
    }),
    copyEntry: createAction<CopyEntryResponse, CopyEntryArgs>({
        method: 'POST',
        path: ({entryId}) => `${PATH_PREFIX}/entries/${filterUrlFragment(entryId)}/copy`,
        params: (args, headers) => {
            const body: Omit<CopyEntryArgs, 'entryId'> = {
                destination: normalizeDestination(args.destination),
            };
            if (args.name) {
                body.name = args.name;
            }
            return {body, headers};
        },
    }),
    copyWorkbookEntry: createAction<CopyWorkbookEntryResponse, CopyWorkbookEntryArgs>({
        method: 'POST',
        path: ({entryId}) => `${PATH_PREFIX_V2}/entries/${filterUrlFragment(entryId)}/copy`,
        params: (args, headers) => {
            const body: Omit<CopyWorkbookEntryArgs, 'entryId'> = {};

            if (args.name) {
                body.name = args.name;
            }

            return {body, headers};
        },
    }),
    copyEntriesToWorkbook: createAction<CopyEntriesToWorkbookResponse, CopyEntriesToWorkbookArgs>({
        method: 'POST',
        path: () => `${PATH_PREFIX_V2}/copy-entries`,
        params: (args, headers) => ({
            body: {workbookId: args.workbookId, entryIds: args.entryIds},
            headers,
        }),
    }),
    renameEntry: createAction<RenameEntryResponse, RenameEntryArgs>({
        method: 'POST',
        path: ({entryId}) => `${PATH_PREFIX}/entries/${filterUrlFragment(entryId)}/rename`,
        params: ({name}, headers) => ({body: {name}, headers}),
        timeout: TIMEOUT_60_SEC,
    }),
    createFolder: createAction<CreateFolderResponse, CreateFolderArgs>({
        method: 'POST',
        path: () => `${PATH_PREFIX}/entries`,
        params: ({key}, headers) => {
            return {
                body: {
                    scope: 'folder',
                    type: '',
                    key,
                    meta: {},
                    data: {},
                },
                headers,
            };
        },
    }),
    _deleteUSEntry: createAction<DeleteUSEntryResponse, DeleteUSEntryArgs>({
        method: 'DELETE',
        path: ({entryId}) => `${PATH_PREFIX}/entries/${filterUrlFragment(entryId)}`,
        params: ({lockToken, scope, types}, headers) => ({
            query: {lockToken, scope, types},
            headers,
        }),
    }),
    _switchPublicationStatus: createAction<
        SwitchPublicationStatusResponse,
        SwitchPublicationStatusArgs
    >({
        method: 'POST',
        path: () => `${PRIVATE_PATH_PREFIX}/entries/switchPublicationStatus`,
        params: ({entries, mainEntry}, headers) => ({
            body: {entries, mainEntry},
            headers,
        }),
    }),
    _getEntriesByKeyPattern: createAction<
        GetEntriesByKeyPatternResponse,
        GetEntriesByKeyPatternArgs
    >({
        method: 'GET',
        path: () => `${PRIVATE_PATH_PREFIX}/getEntriesByKeyPattern`,
        params: ({keyPattern}, headers) => ({query: {keyPattern}, headers}),
    }),
    getRelationsGraph: createAction<GetRelationsGraphResponse, GetRelationsGraphArgs>({
        method: 'GET',
        path: ({entryId}) => `${PATH_PREFIX}/entries/${filterUrlFragment(entryId)}/relations-graph`,
        timeout: TIMEOUT_90_SEC,
    }),
    getEntriesAnnotation: createAction<GetEntriesAnnotationResponse, GetEntriesAnnotationArgs>({
        method: 'POST',
        path: () => `${PATH_PREFIX}/get-entries-annotation`,
        params: (params, headers) => ({
            body: params,
            headers,
        }),
    }),
};
