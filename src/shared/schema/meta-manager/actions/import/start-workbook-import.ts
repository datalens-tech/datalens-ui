import {createTypedAction} from '../../../gateway-utils';
import {startWorkbookImportArgsSchema, startWorkbookImportResultSchema} from '../../schemas/import';

const PATH_PREFIX = '/workbooks/import';

export const startWorkbookImport = createTypedAction(
    {
        paramsSchema: startWorkbookImportArgsSchema,
        resultSchema: startWorkbookImportResultSchema,
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
