import z from 'zod';

import {EntryScope, EntryUpdateMode} from '../../..';
import {dashSchema, dataSchema} from '../../../zod-schemas/dash';

export const deleteDashArgsSchema = z.strictObject({
    dashboardId: z.string(),
    lockToken: z.string().optional(),
});

export const deleteDashResultSchema = z.object({});

const dashUsSchema = z.object({
    ...dashSchema.shape,
    entryId: z.string(),
    scope: z.literal(EntryScope.Dash),
    public: z.boolean(),
    isFavorite: z.boolean(),
    createdAt: z.string(),
    createdBy: z.string(),
    updatedAt: z.string(),
    updatedBy: z.string(),
    revId: z.string(),
    savedId: z.string(),
    publishedId: z.string(),
    meta: z.record(z.string(), z.string()),
    links: z.record(z.string(), z.string()).optional(),
    key: z.union([z.null(), z.string()]),
    workbookId: z.union([z.null(), z.string()]),
    type: z.literal(''),
});

export const updateDashArgsSchema = z.strictObject({
    key: z.string().min(1),
    workbookId: z.string().optional(),
    data: dataSchema,
    meta: z.record(z.any(), z.any()),
    links: z.record(z.string(), z.string()),
    entryId: z.string(),
    revId: z.string(),
    mode: z.enum(EntryUpdateMode),
});

export const updateDashResultSchema = dashUsSchema;

export const createDashArgsSchema = z.strictObject({
    key: z.string().min(1),
    data: dataSchema,
    meta: z.record(z.any(), z.any()).optional(),
    links: z.record(z.string(), z.string()).optional(),
    workbookId: z.string().optional(),
    lockToken: z.string().optional(),
    mode: z.enum(EntryUpdateMode),
});

export const createDashResultSchema = dashUsSchema;

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
    links: z.record(z.string(), z.string()).optional(),
    meta: z.record(z.string(), z.string()),
    public: z.boolean(),
    publishedId: z.string(),
    revId: z.string(),
    savedId: z.string(),
    scope: z.literal(EntryScope.Dash),
    tenantId: z.string(),
    type: z.literal(''),
    updatedAt: z.string(),
    updatedBy: z.string(),
    version: z.literal(1),
    workbookId: z.union([z.null(), z.string()]),
});
