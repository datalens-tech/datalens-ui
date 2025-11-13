import z from 'zod';

import {createTypedAction} from '../../../gateway-utils';
import {collectionPermissionsSchema, collectionSchema} from '../../schemas/collections';

export const getCollectionArgsSchema = z.object({
    collectionId: z.string(),
    includePermissionsInfo: z.boolean().optional(),
});

export const getCollectionResultSchema = collectionSchema.extend({
    permissions: collectionPermissionsSchema.optional(),
});

export const getCollection = createTypedAction(
    {
        paramsSchema: getCollectionArgsSchema,
        resultSchema: getCollectionResultSchema,
    },
    {
        method: 'GET',
        path: ({collectionId}) => `/v1/collections/${collectionId}`,
        params: ({includePermissionsInfo}, headers) => ({query: {includePermissionsInfo}, headers}),
    },
);
