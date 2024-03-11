import {TIMEOUT_60_SEC} from '../../../constants';
import {makeUserId} from '../../../modules/user';
import {createAction} from '../../gateway-utils';
import {defaultParamsSerializer} from '../../utils';
import {
    CopyWorkbookArgs,
    CopyWorkbookResponse,
    CopyWorkbookTemplateArgs,
    CopyWorkbookTemplateResponse,
    CreateWorkbookArgs,
    CreateWorkbookResponse,
    DeleteWorkbookArgs,
    DeleteWorkbookResponse,
    GetWorkbookArgs,
    GetWorkbookEntriesArgs,
    GetWorkbookEntriesResponse,
    GetWorkbookResponse,
    GetWorkbooksListArgs,
    GetWorkbooksListResponse,
    MigrateEntriesToWorkbookArgs,
    MigrateEntriesToWorkbookResponse,
    MoveWorkbookArgs,
    MoveWorkbookResponse,
    MoveWorkbooksArgs,
    MoveWorkbooksResponse,
    UpdateWorkbookArgs,
    UpdateWorkbookResponse,
} from '../types';

export const PATH_PREFIX = '/v2/workbooks';
const MOVE_LIST_PATH_PREFIX = '/v2/move-workbooks';

export const workbooksActions = {
    createWorkbook: createAction<CreateWorkbookResponse, CreateWorkbookArgs>({
        method: 'POST',
        path: () => PATH_PREFIX,
        params: ({collectionId, title, description}, headers) => ({
            body: {collectionId, title, description},
            headers,
        }),
    }),

    getWorkbook: createAction<GetWorkbookResponse, GetWorkbookArgs>({
        method: 'GET',
        path: ({workbookId}) => `${PATH_PREFIX}/${workbookId}`,
        params: ({includePermissionsInfo}, headers) => ({query: {includePermissionsInfo}, headers}),
    }),

    getWorkbookEntries: createAction<GetWorkbookEntriesResponse, GetWorkbookEntriesArgs>({
        method: 'GET',
        path: ({workbookId}) => `${PATH_PREFIX}/${workbookId}/entries`,
        params: (
            {includePermissionsInfo, page, pageSize, onlyMy, orderBy, filters, scope},
            headers,
            {ctx},
        ) => ({
            query: {
                includePermissionsInfo,
                page,
                pageSize,
                orderBy,
                filters,
                scope,
                createdBy: onlyMy ? makeUserId(ctx.get('userId')!) : undefined,
            },
            headers,
        }),
        paramsSerializer: defaultParamsSerializer,
    }),

    getWorkbooksList: createAction<GetWorkbooksListResponse, GetWorkbooksListArgs>({
        method: 'GET',
        path: () => PATH_PREFIX,
        params: (args, headers) => ({
            headers,
            query: args
                ? {
                      collectionId: args.collectionId,
                      includePermissionsInfo: args.includePermissionsInfo,
                      filterString: args.filterString,
                      page: args.page,
                      pageSize: args.pageSize,
                      orderField: args.orderField,
                      orderDirection: args.orderDirection,
                      onlyMy: args.onlyMy,
                  }
                : undefined,
        }),
    }),

    updateWorkbook: createAction<UpdateWorkbookResponse, UpdateWorkbookArgs>({
        method: 'POST',
        path: ({workbookId}) => `${PATH_PREFIX}/${workbookId}/update`,
        params: ({title, description}, headers) => ({body: {title, description}, headers}),
    }),

    moveWorkbook: createAction<MoveWorkbookResponse, MoveWorkbookArgs>({
        method: 'POST',
        path: ({workbookId}) => `${PATH_PREFIX}/${workbookId}/move`,
        params: ({collectionId, title}, headers) => ({body: {collectionId, title}, headers}),
    }),

    moveWorkbooks: createAction<MoveWorkbooksResponse, MoveWorkbooksArgs>({
        method: 'POST',
        path: () => MOVE_LIST_PATH_PREFIX,
        params: ({workbookIds, collectionId}, headers) => ({
            body: {workbookIds, collectionId},
            headers,
        }),
    }),

    deleteWorkbook: createAction<DeleteWorkbookResponse, DeleteWorkbookArgs>({
        method: 'DELETE',
        path: ({workbookId}) => `${PATH_PREFIX}/${workbookId}`,
        params: (_, headers) => ({headers}),
    }),

    copyWorkbook: createAction<CopyWorkbookResponse, CopyWorkbookArgs>({
        method: 'POST',
        path: ({workbookId}) => `${PATH_PREFIX}/${workbookId}/copy`,
        params: ({collectionId, title}, headers) => ({body: {collectionId, title}, headers}),
        timeout: TIMEOUT_60_SEC,
    }),

    copyWorkbookTemplate: createAction<CopyWorkbookTemplateResponse, CopyWorkbookTemplateArgs>({
        method: 'POST',
        path: ({workbookId}) => `${PATH_PREFIX}/${workbookId}/copyTemplate`,
        params: ({collectionId, title}, headers) => ({body: {collectionId, title}, headers}),
    }),

    migrateEntriesToWorkbookByTransfer: createAction<
        MigrateEntriesToWorkbookResponse,
        MigrateEntriesToWorkbookArgs
    >({
        method: 'POST',
        path: ({workbookId}) => `${PATH_PREFIX}/${workbookId}/migrate-entries`,
        params: ({entryIds}, headers) => ({body: {entryIds}, headers}),
    }),
    migrateEntriesToWorkbookByCopy: createAction<
        MigrateEntriesToWorkbookResponse,
        MigrateEntriesToWorkbookArgs
    >({
        method: 'POST',
        path: ({workbookId}) => `${PATH_PREFIX}/${workbookId}/migrate-copied-entries`,
        params: ({entryIds}, headers) => ({body: {entryIds}, headers}),
    }),
};
