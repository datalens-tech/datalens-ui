import {omit, uniqBy} from 'lodash';

import {
    DL_COMPONENT_HEADER,
    DlComponentHeader,
    TIMEOUT_90_SEC,
    US_MASTER_TOKEN_HEADER,
    WORKBOOK_ID_HEADER,
} from '../../../constants';
import {getEntryNameByKey, normalizeDestination} from '../../../modules';
import {Feature} from '../../../types/feature';
import {isEnabledServerFeature} from '../../../utils/feature';
import {createAction} from '../../gateway-utils';
import {defaultParamsSerializer, filterUrlFragment} from '../../utils';
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
    GetEntriesArgs,
    GetEntriesByKeyPatternArgs,
    GetEntriesByKeyPatternResponse,
    GetEntriesOutput,
    GetEntriesResponse,
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
    ListDirectoryArgs,
    ListDirectoryOutput,
    ListDirectoryResponse,
    MoveEntryArgs,
    MoveEntryResponse,
    PrivateGetEntryArgs,
    ProxyCreateEntryArgs,
    RenameEntryArgs,
    RenameEntryResponse,
    SwitchPublicationStatusArgs,
    SwitchPublicationStatusResponse,
} from '../types';

const PATH_PREFIX = '/v1';
const PATH_PREFIX_V2 = '/v2';
const PRIVATE_PATH_PREFIX = '/private';

export const entriesActions = {
    getEntry: createAction<GetEntryResponse, GetEntryArgs>({
        method: 'GET',
        path: ({entryId}) => `${PATH_PREFIX}/entries/${filterUrlFragment(entryId)}`,
        params: ({entryId: _entryId, workbookId, includeDlComponentUiData, ...query}, headers) => ({
            query,
            headers: {
                ...headers,
                ...(includeDlComponentUiData ? {[DL_COMPONENT_HEADER]: DlComponentHeader.UI} : {}),
                ...(workbookId ? {[WORKBOOK_ID_HEADER]: workbookId} : {}),
            },
        }),
    }),
    _proxyGetEntry: createAction<GetEntryResponse, PrivateGetEntryArgs>({
        method: 'GET',
        path: ({entryId}) => `${PRIVATE_PATH_PREFIX}/entries/${filterUrlFragment(entryId)}`,
        params: ({entryId: _entryId, workbookId, usMasterToken, ...query}, headers) => ({
            query,
            headers: {
                ...headers,
                ...(workbookId ? {[WORKBOOK_ID_HEADER]: workbookId} : {}),
                [US_MASTER_TOKEN_HEADER]: usMasterToken,
            },
        }),
    }),
    _proxyCreateEntry: createAction<GetEntryResponse, ProxyCreateEntryArgs>({
        method: 'POST',
        path: () => `${PRIVATE_PATH_PREFIX}/entries/`,
        params: (
            {usMasterToken, workbookId, data, name, type, scope, mode, links, key},
            headers,
        ) => ({
            headers: {
                ...headers,
                ...(workbookId ? {[WORKBOOK_ID_HEADER]: workbookId} : {}),
                [US_MASTER_TOKEN_HEADER]: usMasterToken,
            },
            body: {
                workbookId,
                data,
                name,
                type,
                scope,
                mode,
                links,
                ...(key ? {key} : {}),
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
    _getEntryMeta: createAction<GetEntryMetaResponse, GetEntryMetaArgs>({
        method: 'GET',
        path: ({entryId}) => `${PRIVATE_PATH_PREFIX}/entries/${entryId}/meta`,
        params: (_, headers, {ctx}) => ({
            headers: {
                ...headers,
                [US_MASTER_TOKEN_HEADER]: ctx.config.usMasterToken,
            },
        }),
    }),
    getRevisions: createAction<GetRevisionsOutput, GetRevisionsArgs, GetRevisionsResponse>({
        method: 'GET',
        path: ({entryId}) => `${PATH_PREFIX}/entries/${filterUrlFragment(entryId)}/revisions`,
        params: (args, headers, {ctx}) => {
            let updatedAfter;
            if (!isEnabledServerFeature(ctx, Feature.RevisionsListNoLimit) && !args.revIds) {
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
    listDirectory: createAction<ListDirectoryOutput, ListDirectoryArgs, ListDirectoryResponse>({
        method: 'GET',
        path: () => `${PATH_PREFIX}/navigation`,
        params: (query, headers) => ({query, headers}),
        transformResponseData: (data) => ({
            hasNextPage: Boolean(data.nextPageToken),
            breadCrumbs: data.breadCrumbs,
            entries: data.entries.map((entry) => ({
                ...entry,
                name: getEntryNameByKey({key: entry.key, index: -1}),
            })),
        }),
        paramsSerializer: defaultParamsSerializer,
    }),
    getEntries: createAction<GetEntriesOutput, GetEntriesArgs, GetEntriesResponse>({
        method: 'GET',
        path: () => `${PATH_PREFIX}/entries`,
        params: (query, headers) => ({query, headers}),
        transformResponseData: (data) => ({
            hasNextPage: Boolean(data.nextPageToken),
            entries: data.entries.map((entry) => ({
                ...entry,
                name: getEntryNameByKey({key: entry.key, index: -1}),
            })),
        }),
        paramsSerializer: defaultParamsSerializer,
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
                    name: getEntryNameByKey({key: relationEntry.key, index: -1}),
                })),
                (relationEntry) => relationEntry.entryId,
            );
            if (args.excludeUnregistredDlsEntries) {
                if (isEnabledServerFeature(ctx, Feature.UseYqlFolderKey)) {
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
        params: ({lockToken}, headers) => ({query: {lockToken}, headers}),
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
};
