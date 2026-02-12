import z from 'zod';

export const deleteEmbedArgsSchema = z.object({
    embedId: z.string(),
});

export const deleteEmbedResultSchema = z.object({
    embedId: z.string(),
});
