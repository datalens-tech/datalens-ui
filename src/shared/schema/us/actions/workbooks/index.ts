import {makeUserId} from '../../../../modules/user';
import {createAction} from '../../../gateway-utils';
import {defaultParamsSerializer} from '../../../utils';
import type {
    GetWorkbookEntriesArgs,
    GetWorkbookEntriesResponse,
    MigrateEntriesToWorkbookArgs,
    MigrateEntriesToWorkbookResponse,
} from '../../types';

import {copyWorkbook} from './copy-workbook';
import {createWorkbook} from './create-workbook';
import {deleteWorkbook} from './delete-workbook';
import {deleteWorkbooks} from './delete-workbooks';
import {getWorkbook} from './get-workbook';
import {getWorkbooksList} from './get-workbooks-list';
import {moveWorkbook} from './move-workbook';
import {moveWorkbooks} from './move-workbooks';
import {updateWorkbook} from './update-workbook';

const PATH_PREFIX = '/v2/workbooks';

export const workbooksActions = {
    createWorkbook,
    getWorkbook,
    getWorkbooksList,
    updateWorkbook,
    moveWorkbook,
    moveWorkbooks,
    deleteWorkbook,
    copyWorkbook,
    deleteWorkbooks,

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
