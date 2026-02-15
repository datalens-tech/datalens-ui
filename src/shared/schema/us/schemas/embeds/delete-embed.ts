import z from 'zod';

export const deleteEmbedArgsSchema = z.object({
    embedId: z.string().describe('ID of the embedding to delete.'),
});

export const deleteEmbedResultSchema = z.object({
    embedId: z.string().describe('ID of the deleted embedding.'),
});
