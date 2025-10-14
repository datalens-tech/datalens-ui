import z from 'zod/v4';

export const deleteWizardChartArgsSchema = z.object({
    chartId: z.string(),
});

export const deleteWizardChartResultSchema = z.object({});

export const getWizardChartArgsSchema = z.object({
    chartId: z.string(),
    workbookId: z.union([z.string(), z.null()]).optional(),
    revId: z.string().optional(),
    includePermissions: z.boolean().optional(),
    includeLinks: z.boolean().optional(),
    includeFavorite: z.boolean().optional(),
    branch: z.literal(['saved', 'published']).optional(),
});

export const getWizardChartResultSchema = z.unknown();
