import z from 'zod';

import {createTypedAction} from '../../../gateway-utils';
import {workbookSchema} from '../../schemas/workbooks';

const deleteWorkbooksArgsSchema = z.object({
    workbookIds: z.array(z.string()),
});

export const deleteWorkbooksResultSchema = z.object({
    workbooks: z.array(workbookSchema),
});

export const deleteWorkbooks = createTypedAction(
    {
        paramsSchema: deleteWorkbooksArgsSchema,
        resultSchema: deleteWorkbooksResultSchema,
    },
    {
        method: 'DELETE',
        path: () => '/v2/delete-workbooks',
        params: ({workbookIds}, headers) => ({
            body: {workbookIds},
            headers,
        }),
    },
);
