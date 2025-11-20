import z from 'zod';

import {createTypedAction} from '../../../gateway-utils';
import {workbookSchema} from '../../schemas/workbooks';

const moveWorkbooksArgsSchema = z.object({
    workbookIds: z.array(z.string()),
    collectionId: z.string().nullable(),
});

export const moveWorkbooksResultSchema = z.object({
    workbooks: z.array(workbookSchema),
});

export const moveWorkbooks = createTypedAction(
    {
        paramsSchema: moveWorkbooksArgsSchema,
        resultSchema: moveWorkbooksResultSchema,
    },
    {
        method: 'POST',
        path: () => '/v2/move-workbooks',
        params: ({workbookIds, collectionId}, headers) => ({
            body: {workbookIds, collectionId},
            headers,
        }),
    },
);
