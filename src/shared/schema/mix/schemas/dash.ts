import z from 'zod/v4';

import {EntryScope} from '../../..';
import {dashSchema} from '../../../zod-schemas/dash';

export const deleteDashArgsSchema = z.object({
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

export const updateDashArgsSchema = z.object({
    ...dashSchema.partial().shape,
    entryId: z.string(),
});

export const updateDashResultSchema = dashUsSchema;

export const createDashArgsSchema = z.object({
    ...dashSchema.shape,
    workbookId: z.union([z.null(), z.string()]).optional(),
    lockToken: z.string().optional(),
    mode: z.literal(['publish', 'save']),
});

export const createDashResultSchema = dashUsSchema;

export const getDashArgsSchema = z.object({
    dashboardId: z.string(),
    revId: z.string().optional(),
    includePermissions: z.boolean().optional().default(false),
    includeLinks: z.boolean().optional().default(false),
    includeFavorite: z.boolean().optional().default(false),
    branch: z.literal(['published', 'saved']).optional().default('published'),
});

export const getDashResultSchema = dashUsSchema;
