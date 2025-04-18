import {createAction} from '../../gateway-utils';
import type {
    CancelWorkbookExportArgs,
    CancelWorkbookExportResponse,
    GetWorkbookExportResultArgs,
    GetWorkbookExportResultResponse,
    GetWorkbookExportStatusArgs,
    GetWorkbookExportStatusResponse,
    StartWorkbookExportArgs,
    StartWorkbookExportResponse,
} from '../types';

const PATH_PREFIX = '/workbooks/export';

export const exportActions = {
    startWorkbookExport: createAction<StartWorkbookExportResponse, StartWorkbookExportArgs>({
        method: 'POST',
        path: () => PATH_PREFIX,
        params: ({workbookId}, headers) => ({
            body: {workbookId},
            headers,
        }),
    }),

    getWorkbookExportStatus: createAction<
        GetWorkbookExportStatusResponse,
        GetWorkbookExportStatusArgs
    >({
        method: 'GET',
        path: ({exportId}) => `${PATH_PREFIX}/${exportId}`,
        params: (_, headers) => ({headers}),
    }),

    getWorkbookExportResult: createAction<
        GetWorkbookExportResultResponse,
        GetWorkbookExportResultArgs
    >({
        method: 'GET',
        path: ({exportId}) => `${PATH_PREFIX}/${exportId}/result`,
        params: (_, headers) => ({headers}),
    }),

    cancelWorkbookExport: createAction<CancelWorkbookExportResponse, CancelWorkbookExportArgs>({
        method: 'POST',
        path: ({exportId}) => `${PATH_PREFIX}/${exportId}/cancel`,
        params: (_, headers) => ({headers}),
    }),
};
