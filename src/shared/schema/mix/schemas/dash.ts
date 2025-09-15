import z from 'zod/v4';

export const deleteDashArgsSchema = z.object({
    dashboardId: z.string(),
    lockToken: z.string().optional(),
});

export const deleteDashResultSchema = z.object({});
