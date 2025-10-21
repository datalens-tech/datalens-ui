import z from 'zod';

export const deleteQLChartArgsSchema = z.object({
    chartId: z.string(),
});

export const deleteQLChartResultSchema = z.object({});

export const getQLChartArgsSchema = z.object({
    chartId: z.string(),
    workbookId: z.union([z.string(), z.null()]).optional(),
    revId: z.string().optional(),
    includePermissions: z.boolean().optional(),
    includeLinks: z.boolean().optional(),
    includeFavorite: z.boolean().optional(),
    branch: z.literal(['saved', 'published']).optional(),
});

export const getQLChartResultSchema = z.unknown();
