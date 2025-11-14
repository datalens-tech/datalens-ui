import z from 'zod';

import {createTypedAction} from '../../../gateway-utils';
import {workbookSchema} from '../../schemas/workbooks';

const deleteWorkbookArgsSchema = z.object({
    workbookId: z.string(),
});

export const deleteWorkbookResultSchema = workbookSchema;

export const deleteWorkbook = createTypedAction(
    {
        paramsSchema: deleteWorkbookArgsSchema,
        resultSchema: deleteWorkbookResultSchema,
    },
    {
        method: 'DELETE',
        path: ({workbookId}) => `/v2/workbooks/${workbookId}`,
        params: (_, headers) => ({headers}),
    },
);
