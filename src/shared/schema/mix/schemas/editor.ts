import z from 'zod/v4';

import {EDITOR_TYPE, EntryScope} from '../../..';

export const deleteEditorChartArgsSchema = z.object({
    chartId: z.string(),
});

export const deleteEditorChartResultSchema = z.object({});

export const getEditorChartArgsSchema = z.object({
    chardId: z.string(),
    workbookId: z.union([z.string(), z.null()]).default(null).optional(),
    revId: z.string().optional(),
    includePermissions: z.boolean().default(false).optional(),
    includeLinks: z.boolean().default(false).optional(),
    branch: z.literal(['saved', 'published']).default('published').optional(),
});

const editorUsSchema = z.object({
    data: z.union([
        z.object({
            js: z.string(),
            url: z.string(),
            params: z.string(),
            shared: z.string(),
        }),
        z.object({
            controls: z.string(),
            meta: z.string(),
            params: z.string(),
            prepare: z.string(),
            sources: z.string(),
        }),
    ]),
    entryId: z.string(),
    scope: z.literal(EntryScope.Widget),
    type: z.enum(EDITOR_TYPE),
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
});

export const getEditorChartResultSchema = editorUsSchema;
