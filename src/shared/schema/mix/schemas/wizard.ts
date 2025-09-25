import z from 'zod/v4';

export const deleteWizardChartArgsSchema = z.object({
    chartId: z.string(),
});

export const deleteWizardChartResultSchema = z.object({});
