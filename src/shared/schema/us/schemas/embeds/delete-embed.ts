import z from 'zod';

export const deleteEmbedArgsSchema = z.object({
    embedId: z.string().describe('ID of the embed to delete'),
});

export const deleteEmbedResultSchema = z.object({
    embedId: z.string().describe('ID of the deleted embed'),
});
