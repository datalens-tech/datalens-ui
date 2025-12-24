import z from 'zod';

import {createTypedAction} from '../../../gateway-utils';

export const getRootCollectionPermissionsResultSchema = z.object({
    createCollectionInRoot: z.boolean(),
    createWorkbookInRoot: z.boolean(),
});

export const getRootCollectionPermissions = createTypedAction(
    {
        paramsSchema: undefined,
        resultSchema: getRootCollectionPermissionsResultSchema,
    },
    {
        method: 'GET',
        path: () => '/v1/root-collection-permissions',
        params: (_, headers) => ({
            headers,
        }),
    },
);
