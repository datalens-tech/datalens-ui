import {createTypedAction} from '../../../gateway-utils';
import {defaultParamsSerializer} from '../../../utils';
import {
    getWorkbookEntriesArgsSchema,
    getWorkbookEntriesResultSchema,
} from '../../schemas/workbooks/get-workbook-entries';

/**
 * This action is a typed duplicate of getWorkbookEntries
 * but had to be duplicated because the old action was incorrectly typed,
 * these types have deeply grown throughout the codebase and it was not possible to simply fix them.
 */
export const getWorkbookEntriesTyped = createTypedAction(
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
