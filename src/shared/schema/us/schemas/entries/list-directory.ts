import z from 'zod';

import {permissionsSchema} from '../../../../zod-schemas/permissions';

export const listDirectoryArgsSchema = z.object({
    path: z.string().optional(),
    createdBy: z.union([z.string(), z.array(z.string())]).optional(),
    orderBy: z
        .object({
            field: z.enum(['createdAt', 'name']),
            direction: z.enum(['desc', 'asc']),
        })
        .optional(),
    filters: z
        .object({
            name: z.string().optional(),
        })
        .optional(),
    page: z.number().optional(),
    pageSize: z.number().optional(),
    includePermissionsInfo: z.boolean().optional(),
});

export const listDirectoryBreadCrumbSchema = z.object({
    title: z.string(),
    path: z.string(),
    entryId: z.string(),
    isLocked: z.boolean(),
    permissions: permissionsSchema,
});

export const listDirectoryEntryOutputSchema = z.object({
    entryId: z.string(),
    key: z.string(),
    scope: z.string(),
    type: z.string(),
    meta: z.record(z.string(), z.unknown()).nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    createdBy: z.string(),
    updatedBy: z.string(),
    savedId: z.string(),
    publishedId: z.string().nullable(),
    hidden: z.boolean(),
    workbookId: z.string(),
    workbookTitle: z.string().nullable().optional(),
    collectionId: z.string().nullable(),
    collectionTitle: z.string().nullable().optional(),
    isFavorite: z.boolean(),
    isLocked: z.boolean(),
    permissions: permissionsSchema.optional(),
    name: z.string(),
});

export const listDirectoryEntryResponseSchema = listDirectoryEntryOutputSchema.extend({
    name: z.string(),
});

export const listDirectoryResultSchema = z.object({
    nextPageToken: z.boolean(),
    breadCrumbs: z.array(listDirectoryBreadCrumbSchema),
    entries: z.array(listDirectoryEntryOutputSchema),
});

export const listDirectoryTransformedSchema = z.object({
    hasNextPage: z.boolean(),
    breadCrumbs: z.array(listDirectoryBreadCrumbSchema),
    entries: z.array(listDirectoryEntryResponseSchema),
});
