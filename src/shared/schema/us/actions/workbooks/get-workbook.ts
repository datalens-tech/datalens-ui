import z from 'zod';

import {createTypedAction} from '../../../gateway-utils';
import {workbookPermissionsSchema, workbookSchema} from '../../schemas/workbooks';

export const getWorkbookArgsSchema = z.object({
    workbookId: z.string(),
    includePermissionsInfo: z.boolean().optional(),
});

export const getWorkbookResultSchema = workbookSchema.extend({
    permissions: workbookPermissionsSchema,
});

export const getWorkbook = createTypedAction(
    {
        paramsSchema: getWorkbookArgsSchema,
        resultSchema: getWorkbookResultSchema,
    },
    {
        method: 'GET',
        path: ({workbookId}) => `/v2/workbooks/${workbookId}`,
        params: ({includePermissionsInfo}, headers) => ({query: {includePermissionsInfo}, headers}),
    },
);
