import type z from 'zod';

import type {
    createEmbedArgsSchema,
    createEmbedResultSchema,
    deleteEmbedArgsSchema,
    deleteEmbedResultSchema,
    embedSchema,
    listEmbedsArgsSchema,
    listEmbedsResultSchema,
} from '../schemas/embeds';

export type Embed = z.infer<typeof embedSchema>;

export type CreateEmbedArgs = z.infer<typeof createEmbedArgsSchema>;

export type CreateEmbedResponse = z.infer<typeof createEmbedResultSchema>;

export type ListEmbedsArgs = z.infer<typeof listEmbedsArgsSchema>;

export type ListEmbedsResponse = z.infer<typeof listEmbedsResultSchema>;

export type DeleteEmbedArgs = z.infer<typeof deleteEmbedArgsSchema>;

export type DeleteEmbedResponse = z.infer<typeof deleteEmbedResultSchema>;
