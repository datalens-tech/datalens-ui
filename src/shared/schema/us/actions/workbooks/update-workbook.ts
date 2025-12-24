import z from 'zod';

import {createTypedAction} from '../../../gateway-utils';
import {workbookSchema} from '../../schemas/workbooks';

const updateWorkbookArgsSchema = z.object({
    workbookId: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
});

export const updateWorkbookResultSchema = workbookSchema;

export const updateWorkbook = createTypedAction(
    {
        paramsSchema: updateWorkbookArgsSchema,
        resultSchema: updateWorkbookResultSchema,
    },
    {
        method: 'POST',
        path: ({workbookId}) => `/v2/workbooks/${workbookId}/update`,
        params: ({title, description}, headers) => ({body: {title, description}, headers}),
    },
);
