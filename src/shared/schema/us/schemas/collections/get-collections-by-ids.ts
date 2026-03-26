import z from 'zod';

import {collectionSchema} from './index';

export const getCollectionsByIdsArgsSchema = z.object({
    collectionIds: z.array(z.string()).min(1).max(1000),
});

export const getCollectionsByIdsResultSchema = z.array(collectionSchema);
