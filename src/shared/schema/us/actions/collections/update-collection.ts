import z from 'zod';

import {createTypedAction} from '../../../gateway-utils';
import {collectionSchema} from '../../schemas/collections';

const updateCollectionArgsSchema = z.object({
    collectionId: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
});

export const updateCollectionResultSchema = collectionSchema;

export const updateCollection = createTypedAction(
    {
        paramsSchema: updateCollectionArgsSchema,
        resultSchema: updateCollectionResultSchema,
    },
    {
        method: 'POST',
        path: ({collectionId}) => `/v1/collections/${collectionId}/update`,
        params: ({title, description}, headers) => ({
            body: {
                title,
                description,
            },
            headers,
        }),
    },
);
