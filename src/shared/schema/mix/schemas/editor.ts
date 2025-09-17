import z from 'zod/v4';

export const deleteEditorChartArgsSchema = z.object({
    chartId: z.string(),
});

export const deleteEditorChartResultSchema = z.object({});
