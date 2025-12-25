import z from 'zod';

import {createTypedAction} from '../../../gateway-utils';
import {collectionSchema} from '../../schemas/collections';

const moveCollectionArgsSchema = z.object({
    collectionId: z.string(),
    parentId: z.string().nullable(),
    title: z.string().optional(),
});

export const moveCollectionResultSchema = collectionSchema;

export const moveCollection = createTypedAction(
    {
        paramsSchema: moveCollectionArgsSchema,
        resultSchema: moveCollectionResultSchema,
    },
    {
        method: 'POST',
        path: ({collectionId}) => `/v1/collections/${collectionId}/move`,
        params: ({parentId, title}, headers) => ({
            body: {
                parentId,
                title,
            },
            headers,
        }),
    },
);
