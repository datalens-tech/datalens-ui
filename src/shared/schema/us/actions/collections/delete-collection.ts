import z from 'zod';

import {createTypedAction} from '../../../gateway-utils';
import {collectionSchema} from '../../schemas/collections';

const deleteCollectionArgsSchema = z.object({
    collectionId: z.string(),
});

export const deleteCollectionResultSchema = z.object({
    collections: z.array(collectionSchema),
});

export const deleteCollection = createTypedAction(
    {
        paramsSchema: deleteCollectionArgsSchema,
        resultSchema: deleteCollectionResultSchema,
    },
    {
        method: 'DELETE',
        path: ({collectionId}) => `/v1/collections/${collectionId}`,
        params: (_, headers) => ({headers}),
    },
);
