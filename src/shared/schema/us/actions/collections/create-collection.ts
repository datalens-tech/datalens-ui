import z from 'zod';

import {createTypedAction} from '../../../gateway-utils';
import {collectionSchema} from '../../schemas/collections';
import {datalensOperationSchema} from '../../schemas/operation';

const createCollectionArgsSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    parentId: z.string().nullable(),
});

export const createCollectionResultSchema = collectionSchema.extend({
    operation: datalensOperationSchema.optional(),
});

export const createCollection = createTypedAction(
    {
        paramsSchema: createCollectionArgsSchema,
        resultSchema: createCollectionResultSchema,
    },
    {
        method: 'POST',
        path: () => '/v1/collections',
        params: ({title, description, parentId}, headers) => ({
            body: {title, description, parentId},
            headers,
        }),
    },
);
