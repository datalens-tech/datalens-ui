import z from 'zod';

import {permissionsSchema} from '../../../../zod-schemas/permissions';

export const getEntriesArgsSchema = z
    .object({
        excludeLocked: z.boolean().optional(),
        includeData: z.boolean().optional(),
        includeLinks: z.boolean().optional(),
        filters: z
            .object({
                name: z.string().optional(),
            })
            .optional(),
        orderBy: z
            .object({
                field: z.enum(['createdAt', 'name']),
                direction: z.enum(['desc', 'asc']),
            })
            .optional(),
        createdBy: z.union([z.string(), z.array(z.string())]).optional(),
        page: z.number().optional(),
        pageSize: z.number().optional(),
        includePermissionsInfo: z.boolean().optional(),
        ignoreWorkbookEntries: z.boolean().optional(),
    })
    .and(
        z.union([
            z.object({
                scope: z.string(),
                ids: z.union([z.string(), z.array(z.string())]).optional(),
            }),
            z.object({
                scope: z.string().optional(),
                ids: z.union([z.string(), z.array(z.string())]),
            }),
        ]),
    );

const getEntriesLockedEntry = z.object({
    isLocked: z.literal(true),
    entryId: z.string(),
    scope: z.string(),
    type: z.string(),
});

const getEntriesEntry = z.object({
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
    workbookId: z.string().nullable(),
    workbookTitle: z.string().nullable().optional(),
    isFavorite: z.boolean(),
    isLocked: z.literal(false).optional(),
    permissions: permissionsSchema.optional(),
    links: z.record(z.string(), z.string()).nullable(),
    data: z.record(z.string(), z.unknown()).optional(),
});

export const getEntriesEntryOutputSchema = z.union([getEntriesLockedEntry, getEntriesEntry]);

export const getEntriesEntryResponseSchema = z.union([
    getEntriesLockedEntry.extend({name: z.string()}),
    getEntriesEntry.extend({name: z.string()}),
]);

export const getEntriesResultSchema = z.object({
    nextPageToken: z.string().optional(),
    entries: z.array(getEntriesEntryOutputSchema),
});

export const getEntriesTransformedSchema = z.object({
    hasNextPage: z.boolean(),
    entries: z.array(getEntriesEntryResponseSchema),
});
