import {makeUserId} from '../../../../modules';
import {createAction} from '../../../gateway-utils';
import {defaultParamsSerializer} from '../../../utils';
import type {GetWorkbookEntriesArgs, GetWorkbookEntriesResponse} from '../../types';

export const getWorkbookEntries = createAction<GetWorkbookEntriesResponse, GetWorkbookEntriesArgs>({
    method: 'GET',
    path: ({workbookId}) => `/v2/workbooks/${workbookId}/entries`,
    params: (
        {includePermissionsInfo, page, pageSize, onlyMy, orderBy, filters, scope},
        headers,
        {ctx},
    ) => ({
        query: {
            includePermissionsInfo,
            page,
            pageSize,
            orderBy,
            filters,
            scope,
            createdBy: onlyMy ? makeUserId(ctx.get('userId')!) : undefined,
        },
        headers,
    }),
    paramsSerializer: defaultParamsSerializer,
});
