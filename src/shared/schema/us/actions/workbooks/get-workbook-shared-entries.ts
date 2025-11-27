import {makeUserId} from '../../../../modules';
import {createAction} from '../../../gateway-utils';
import {defaultParamsSerializer} from '../../../utils';
import type {GetWorkbookEntriesArgs, GetWorkbookSharedEntriesResponse} from '../../types';

export const getWorkbookSharedEntries = createAction<
    GetWorkbookSharedEntriesResponse,
    GetWorkbookEntriesArgs
>({
    method: 'GET',
    path: ({workbookId}) => `/v2/workbooks/${workbookId}/shared-entries`,
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
