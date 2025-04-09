import {createAction} from '../../gateway-utils';
import type {
    GetWorkbookImportStatusArgs,
    GetWorkbookImportStatusResponse,
    StartWorkbookImportArgs,
    StartWorkbookImportResponse,
} from '../types';

const PATH_PREFIX = '/workbooks/import';

export const importActions = {
    startWorkbookImport: createAction<StartWorkbookImportResponse, StartWorkbookImportArgs>({
        method: 'POST',
        path: () => PATH_PREFIX,
        params: ({data, title, description, collectionId}, headers) => ({
            body: {data, title, description, collectionId},
            headers,
        }),
    }),

    getWorkbookImportStatus: createAction<
        GetWorkbookImportStatusResponse,
        GetWorkbookImportStatusArgs
    >({
        method: 'GET',
        path: ({importId}) => `${PATH_PREFIX}/${importId}`,
        params: (_, headers) => ({headers}),
    }),
};
