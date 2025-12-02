import z from 'zod';

import {EntryScope} from '../../../..';
import {dataSchema} from '../../../../zod-schemas/dash';

export const DASH_VERSION_1 = 1;

export const dashSchemaV1 = z.object({
    annotation: z
        .object({
            description: z.string().optional(),
        })
        .nullable()
        .optional(),
    createdAt: z.string(),
    createdBy: z.string(),
    data: dataSchema,
    entryId: z.string(),
    hidden: z.boolean(),
    key: z.union([z.null(), z.string()]),
    links: z.record(z.string(), z.string()).nullable().optional(),
    meta: z.record(z.string(), z.string()).nullable(),
    public: z.boolean(),
    publishedId: z.string().nullable(),
    revId: z.string(),
    savedId: z.string(),
    scope: z.literal(EntryScope.Dash),
    tenantId: z.string(),
    type: z.literal(''),
    updatedAt: z.string(),
    updatedBy: z.string(),
    version: z.literal(DASH_VERSION_1),
    workbookId: z.union([z.null(), z.string()]),
});
