import z from 'zod';

export const startWorkbookImportArgsSchema = z.object({
    data: z.record(z.string(), z.unknown()),
    title: z.string(),
    description: z.string().optional(),
    collectionId: z.string().nullable(),
});

export const startWorkbookImportResultSchema = z.object({
    importId: z.string(),
    workbookId: z.string(),
});
