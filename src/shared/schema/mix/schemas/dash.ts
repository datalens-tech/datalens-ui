import z from 'zod';

import {EntryScope, EntryUpdateMode} from '../../..';
import {dataSchema} from '../../../zod-schemas/dash';

export const deleteDashArgsSchema = z.strictObject({
    dashboardId: z.string(),
    lockToken: z.string().optional(),
});

export const deleteDashResultSchema = z.object({});

export const updateDashArgsSchema = z.strictObject({
    key: z.string().min(1),
    workbookId: z.string().optional(),
    data: dataSchema,
    meta: z.record(z.any(), z.any()),
    entryId: z.string(),
    revId: z.string(),
    mode: z.enum(EntryUpdateMode),
    annotation: z
        .object({
            description: z.string(),
        })
        .optional(),
});

export const createDashArgsSchema = z.strictObject({
    key: z.string().min(1),
    data: dataSchema,
    meta: z.record(z.string(), z.string()),
    workbookId: z.string().optional(),
    lockToken: z.string().optional(),
    mode: z.enum(EntryUpdateMode),
    annotation: z
        .object({
            description: z.string(),
        })
        .optional(),
});

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
    meta: z.record(z.string(), z.string()),
    public: z.boolean(),
    publishedId: z.string().nullable(),
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

export const createDashResultSchema = z.object({
    entry: dashSchemaV1,
});

export const updateDashResultSchema = z.object({
    entry: dashSchemaV1,
});
