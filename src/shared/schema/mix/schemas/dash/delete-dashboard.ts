import z from 'zod';

export const deleteDashArgsSchema = z.strictObject({
    dashboardId: z.string(),
    lockToken: z.string().optional(),
});

export const deleteDashResultSchema = z.object({});
