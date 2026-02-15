import z from 'zod';

import {embedSchema, embedSettingsSchema} from './embed';

export const createEmbedArgsSchema = z.object({
    title: z.string().describe('Name of the embedding.'),
    embeddingSecretId: z.string().describe('ID of the key for embedding used for authentication.'),
    entryId: z.string().describe('ID of the entry to be privately embedded.'),
    depsIds: z.array(z.string()).describe('Array of dependency entry IDs.'),
    unsignedParams: z
        .array(z.string())
        .describe('Array of unsigned parameters to be provided in the embedding link.'),
    privateParams: z
        .array(z.string())
        .describe('Array of signed parameters that are provided as part of the token.'),
    publicParamsMode: z.boolean().describe('Whether default parameters mode is enabled.'),
    settings: embedSettingsSchema,
});

export const createEmbedResultSchema = embedSchema;
