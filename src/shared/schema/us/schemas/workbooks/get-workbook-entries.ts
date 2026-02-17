import z from 'zod';

import {EntryScope} from '../../../..';
import {permissionsSchema} from '../../../../zod-schemas/permissions';

export const workbookEntrySchema = z.object({
    entryId: z.string(),
    scope: z.enum(EntryScope),
    type: z.string(),
    key: z.string().nullable(),
    displayKey: z.string().nullable(),
    createdBy: z.string(),
    createdAt: z.string(),
    updatedBy: z.string(),
    updatedAt: z.string(),
    savedId: z.string().nullable(),
    publishedId: z.string().nullable(),
    revId: z.string(),
    meta: z.record(z.string(), z.unknown()).nullable(),
    hidden: z.boolean().nullable(),
    workbookId: z.string().nullable(),
    collectionId: z.string().nullable(),
    tenantId: z.string().nullable(),
    isFavorite: z.boolean(),
    isLocked: z.boolean(),
    permissions: permissionsSchema.optional(),
    mirrored: z.boolean().nullable(),
});

export const getWorkbookEntriesArgsSchema = z.object({
    workbookId: z.string(),
    includePermissionsInfo: z.boolean().optional(),
    page: z.number().optional(),
    pageSize: z.number().optional(),
    createdBy: z.string().optional(),
    scope: z.union([z.string(), z.array(z.string())]).optional(),
    orderBy: z
        .object({
            field: z.enum(['name', 'createdAt']),
            direction: z.enum(['asc', 'desc']),
        })
        .optional(),
    filters: z
        .object({
            name: z.string(),
        })
        .optional(),
});

export const getWorkbookEntriesResultSchema = z.object({
    entries: z.array(workbookEntrySchema),
    nextPageToken: z.string().optional(),
});
