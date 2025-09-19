import z from 'zod/v4';

export const deleteConnectionArgsSchema = z.object({
    connectionId: z.string(),
});

export const deleteConnectionResultSchema = z.unknown();
