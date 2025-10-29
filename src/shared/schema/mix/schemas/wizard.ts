import z from 'zod';

export const deleteWizardChartArgsSchema = z.strictObject({
    chartId: z.string(),
});

export const deleteWizardChartResultSchema = z.object({});

export const getWizardChartArgsSchema = z.strictObject({
    chartId: z.string(),
    workbookId: z.union([z.string(), z.null()]).optional(),
    revId: z.string().optional(),
    includePermissions: z.boolean().optional(),
    includeLinks: z.boolean().optional(),
    includeFavorite: z.boolean().optional(),
    branch: z.enum(['saved', 'published']).optional(),
});

export const getWizardChartResultSchema = z.unknown();
