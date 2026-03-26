import {createTypedAction} from '../../../gateway-utils';
import {startWorkbookExportArgsSchema, startWorkbookExportResultSchema} from '../../schemas/export';

const PATH_PREFIX = '/workbooks/export';

export const startWorkbookExport = createTypedAction(
    {
        paramsSchema: startWorkbookExportArgsSchema,
        resultSchema: startWorkbookExportResultSchema,
    },
    {
        method: 'POST',
        path: () => PATH_PREFIX,
        params: (params, headers) => ({
            body: params,
            headers,
        }),
    },
);
