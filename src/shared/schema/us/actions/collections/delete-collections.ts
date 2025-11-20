import z from 'zod';

import {createTypedAction} from '../../../gateway-utils';
import {collectionSchema} from '../../schemas/collections';

const deleteCollectionsArgsSchema = z.object({
    collectionIds: z.array(z.string()),
});

export const deleteCollectionsResultSchema = z.object({
    collections: z.array(collectionSchema),
});

export const deleteCollections = createTypedAction(
    {
        paramsSchema: deleteCollectionsArgsSchema,
        resultSchema: deleteCollectionsResultSchema,
    },
    {
        method: 'DELETE',
        path: () => '/v1/delete-collections',
        params: ({collectionIds}, headers) => ({
            body: {collectionIds},
            headers,
        }),
    },
);
