import {createTypedAction} from '../../../gateway-utils';
import {
    cancelWorkbookExportArgsSchema,
    cancelWorkbookExportResultSchema,
} from '../../schemas/export';

const PATH_PREFIX = '/workbooks/export';

export const cancelWorkbookExport = createTypedAction(
    {
        paramsSchema: cancelWorkbookExportArgsSchema,
        resultSchema: cancelWorkbookExportResultSchema,
    },
    {
        method: 'POST',
        path: ({exportId}) => `${PATH_PREFIX}/${exportId}/cancel`,
        params: (_, headers) => ({headers}),
    },
);
