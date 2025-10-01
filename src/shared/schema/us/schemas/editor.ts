import z from 'zod/v4';

import {ENTRY_TYPES, EntryScope} from '../../..';

export const editorChartData = z.union([
    z.object({
        js: z.string(),
        url: z.string(),
        params: z.string(),
        shared: z.string(),
    }),
    z.object({
        shared: z.string(),
        params: z.string(),
        sources: z.string(),
        prepare: z.string(),
        controls: z.string(),
        meta: z.string(),
    }),
]);

export const editorChartSchema = z.object({
    entryId: z.string(),
    scope: z.literal(EntryScope.Widget),
    type: z.enum([...ENTRY_TYPES.editor, ...ENTRY_TYPES.legacyEditor]),
    key: z.union([z.null(), z.string()]),
    createdAt: z.string(),
    createdBy: z.string(),
    updatedAt: z.string(),
    updatedBy: z.string(),
    savedId: z.string(),
    publishedId: z.string().nullable(),
    revId: z.string(),
    tenantId: z.string(),
    data: editorChartData,
    meta: z.record(z.string(), z.unknown()).nullable(),
    hidden: z.boolean(),
    public: z.boolean(),
    workbookId: z.union([z.null(), z.string()]),
    links: z.record(z.string(), z.string()).nullable().optional(),
});
