import {createAction} from '../../gateway-utils';
import type {
    GetExportStatusArgs,
    GetExportStatusResponse,
    StartExportArgs,
    StartExportResponse,
} from '../types';

export const exportActions = {
    startExport: createAction<StartExportResponse, StartExportArgs>({
        method: 'POST',
        path: () => '/workbooks/export',
        params: ({workbookId}) => ({
            body: {
                workbookId,
            },
        }),
    }),

    getExportStatus: createAction<GetExportStatusResponse, GetExportStatusArgs>({
        method: 'GET',
        path: ({exportId}) => `/workbooks/export/${exportId}`,
    }),
};
