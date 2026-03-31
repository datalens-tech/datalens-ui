import z from 'zod';

export const cancelWorkbookExportArgsSchema = z.object({
    exportId: z.string(),
});

export const cancelWorkbookExportResultSchema = z.object({
    exportId: z.string(),
});
