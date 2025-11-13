import z from 'zod';

import {TIMEOUT_60_SEC} from '../../../../constants';
import {createTypedAction} from '../../../gateway-utils';
import {datalensOperationSchema} from '../../schemas/operation';
import {workbookSchema} from '../../schemas/workbooks';

const copyWorkbookArgsSchema = z.object({
    workbookId: z.string(),
    collectionId: z.string().nullable().optional(),
    title: z.string().optional(),
});

export const copyWorkbookResultSchema = workbookSchema.extend({
    operation: datalensOperationSchema.optional(),
});

export const copyWorkbook = createTypedAction(
    {
        paramsSchema: copyWorkbookArgsSchema,
        resultSchema: copyWorkbookResultSchema,
    },
    {
        method: 'POST',
        path: ({workbookId}) => `/v2/workbooks/${workbookId}/copy`,
        params: ({collectionId, title}, headers) => ({body: {collectionId, title}, headers}),
        timeout: TIMEOUT_60_SEC,
    },
);
