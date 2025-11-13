import z from 'zod';

import {createTypedAction} from '../../../gateway-utils';
import {collectionSchema} from '../../schemas/collections';

const moveCollectionsArgsSchema = z.object({
    collectionIds: z.array(z.string()),
    parentId: z.string().nullable(),
});

export const moveCollectionsResultSchema = z.object({
    collections: z.array(collectionSchema),
});

export const moveCollections = createTypedAction(
    {
        paramsSchema: moveCollectionsArgsSchema,
        resultSchema: moveCollectionsResultSchema,
    },
    {
        method: 'POST',
        path: () => '/v1/move-collections',
        params: ({collectionIds, parentId}, headers) => ({
            body: {collectionIds, parentId},
            headers,
        }),
    },
);
