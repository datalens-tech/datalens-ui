import z from 'zod';

import {createTypedAction} from '../../../gateway-utils';
import {workbookSchema} from '../../schemas/workbooks';

const moveWorkbookArgsSchema = z.object({
    workbookId: z.string(),
    collectionId: z.string().nullable(),
    title: z.string().optional(),
});

export const moveWorkbookResultSchema = workbookSchema;

export const moveWorkbook = createTypedAction(
    {
        paramsSchema: moveWorkbookArgsSchema,
        resultSchema: moveWorkbookResultSchema,
    },
    {
        method: 'POST',
        path: ({workbookId}) => `/v2/workbooks/${workbookId}/move`,
        params: ({collectionId, title}, headers) => ({body: {collectionId, title}, headers}),
    },
);
