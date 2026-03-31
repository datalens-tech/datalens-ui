import {createTypedAction} from '../../../gateway-utils';
import {
    getWorkbooksByIdsArgsSchema,
    getWorkbooksByIdsResultSchema,
} from '../../schemas/workbooks/get-workbooks-by-ids';

export const getWorkbooksByIds = createTypedAction(
    {
        paramsSchema: getWorkbooksByIdsArgsSchema,
        resultSchema: getWorkbooksByIdsResultSchema,
    },
    {
        method: 'POST',
        path: () => '/v2/workbooks-get-list-by-ids',
        params: ({workbookIds}, headers) => ({
            body: {workbookIds},
            headers,
        }),
    },
);
