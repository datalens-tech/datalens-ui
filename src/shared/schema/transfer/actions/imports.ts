import {createAction} from '../../gateway-utils';
import type {GetImportStatusArgs, GetImportStatusResponse} from '../types';

export const importActions = {
    getImportStatus: createAction<GetImportStatusResponse, GetImportStatusArgs>({
        method: 'GET',
        path: ({importId}) => `/workbooks/import/${importId}`,
    }),
};
