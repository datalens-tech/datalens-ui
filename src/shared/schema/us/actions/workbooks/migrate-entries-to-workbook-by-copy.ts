import {createAction} from '../../../gateway-utils';
import type {MigrateEntriesToWorkbookArgs, MigrateEntriesToWorkbookResponse} from '../../types';

export const migrateEntriesToWorkbookByCopy = createAction<
    MigrateEntriesToWorkbookResponse,
    MigrateEntriesToWorkbookArgs
>({
    method: 'POST',
    path: ({workbookId}) => `/v2/workbooks/${workbookId}/migrate-copied-entries`,
    params: ({entryIds}, headers) => ({body: {entryIds}, headers}),
});
