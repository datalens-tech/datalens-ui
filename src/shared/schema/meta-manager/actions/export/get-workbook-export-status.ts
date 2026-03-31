import {createTypedAction} from '../../../gateway-utils';
import {
    getWorkbookExportStatusArgsSchema,
    getWorkbookExportStatusResultSchema,
} from '../../schemas/export';

const PATH_PREFIX = '/workbooks/export';

export const getWorkbookExportStatus = createTypedAction(
    {
        paramsSchema: getWorkbookExportStatusArgsSchema,
        resultSchema: getWorkbookExportStatusResultSchema,
    },
    {
        method: 'GET',
        path: ({exportId}) => `${PATH_PREFIX}/${exportId}`,
        params: (_, headers) => ({headers}),
    },
);
