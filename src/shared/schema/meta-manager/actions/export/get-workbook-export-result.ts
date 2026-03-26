import {createTypedAction} from '../../../gateway-utils';
import {
    getWorkbookExportResultArgsSchema,
    getWorkbookExportResultResultSchema,
} from '../../schemas/export';

const PATH_PREFIX = '/workbooks/export';

export const getWorkbookExportResult = createTypedAction(
    {
        paramsSchema: getWorkbookExportResultArgsSchema,
        resultSchema: getWorkbookExportResultResultSchema,
    },
    {
        method: 'GET',
        path: ({exportId}) => `${PATH_PREFIX}/${exportId}/result`,
        params: (_, headers) => ({headers}),
    },
);
