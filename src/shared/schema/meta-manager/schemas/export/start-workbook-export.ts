import z from 'zod';

export const startWorkbookExportArgsSchema = z.object({
    workbookId: z.string(),
});

export const startWorkbookExportResultSchema = z.object({
    exportId: z.string(),
});
