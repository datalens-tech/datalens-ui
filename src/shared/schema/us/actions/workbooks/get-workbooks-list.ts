import z from 'zod';

import {createTypedAction} from '../../../gateway-utils';
import {workbookPermissionsSchema, workbookSchema} from '../../schemas/workbooks';

const getWorkbooksListArgsSchema = z
    .object({
        collectionId: z.string().nullable().optional(),
        includePermissionsInfo: z.boolean().optional(),
        filterString: z.string().optional(),
        page: z.number().optional(),
        pageSize: z.number().optional(),
        orderField: z.enum(['title', 'createdAt', 'updatedAt']).optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
        onlyMy: z.boolean().optional(),
    })
    .optional();

const getWorkbooksListResultSchema = z.object({
    workbooks: z.array(
        workbookSchema.extend({
            permissions: workbookPermissionsSchema.optional(),
        }),
    ),
    nextPageToken: z.string().optional(),
});

export const getWorkbooksList = createTypedAction(
    {
        paramsSchema: getWorkbooksListArgsSchema,
        resultSchema: getWorkbooksListResultSchema,
    },
    {
        method: 'GET',
        path: () => '/v2/workbooks',
        params: (args, headers) => ({
            headers,
            query: args
                ? {
                      collectionId: args.collectionId,
                      includePermissionsInfo: args.includePermissionsInfo,
                      filterString: args.filterString,
                      page: args.page,
                      pageSize: args.pageSize,
                      orderField: args.orderField,
                      orderDirection: args.orderDirection,
                      onlyMy: args.onlyMy,
                  }
                : undefined,
        }),
    },
);
