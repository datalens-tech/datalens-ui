import {createTypedAction} from '../../../gateway-utils';
import {
    getWorkbookImportStatusArgsSchema,
    getWorkbookImportStatusResultSchema,
} from '../../schemas/import';

const PATH_PREFIX = '/workbooks/import';

export const getWorkbookImportStatus = createTypedAction(
    {
        paramsSchema: getWorkbookImportStatusArgsSchema,
        resultSchema: getWorkbookImportStatusResultSchema,
    },
    {
        method: 'GET',
        path: ({importId}) => `${PATH_PREFIX}/${importId}`,
        params: (_, headers) => ({headers}),
    },
);
