import {createTypedAction} from '../../../gateway-utils';
import {defaultParamsSerializer} from '../../../utils';
import {
    getWorkbookEntriesArgsSchema,
    getWorkbookEntriesResultSchema,
} from '../../schemas/workbooks/get-workbook-entries';

export const getWorkbookEntries = createTypedAction(
    {
        paramsSchema: getWorkbookEntriesArgsSchema,
        resultSchema: getWorkbookEntriesResultSchema,
    },
    {
        method: 'GET',
        path: ({workbookId}) => `/v2/workbooks/${workbookId}/entries`,
        params: (
            {includePermissionsInfo, page, pageSize, createdBy, orderBy, filters, scope},
            headers,
        ) => ({
            query: {
                includePermissionsInfo,
                page,
                pageSize,
                orderBy,
                filters,
                scope,
                createdBy,
            },
            headers,
        }),
        paramsSerializer: defaultParamsSerializer,
    },
);
