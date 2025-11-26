import z from 'zod';

import {createTypedAction} from '../../../gateway-utils';
import {collectionPermissionsSchema, collectionSchema} from '../../schemas/collections';

const getCollectionBreadcrumbsArgsSchema = z.object({
    collectionId: z.string(),
    includePermissionsInfo: z.boolean().optional(),
});

export const getCollectionBreadcrumbsResultSchema = z.array(
    collectionSchema.extend({
        permissions: collectionPermissionsSchema.optional(),
    }),
);

export const getCollectionBreadcrumbs = createTypedAction(
    {
        paramsSchema: getCollectionBreadcrumbsArgsSchema,
        resultSchema: getCollectionBreadcrumbsResultSchema,
    },
    {
        method: 'GET',
        path: ({collectionId}) => `/v1/collections/${collectionId}/breadcrumbs`,
        params: ({includePermissionsInfo}, headers) => ({headers, query: {includePermissionsInfo}}),
    },
);
