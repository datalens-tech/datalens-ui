import z from 'zod';

import {embedSchema, embedSettingsSchema} from './embed';

export const createEmbedArgsSchema = z.object({
    title: z.string().describe('Title of the embed'),
    embeddingSecretId: z.string().describe('ID of the embedding secret used for authentication'),
    entryId: z.string().describe('ID of the entry to be embedded'),
    depsIds: z.array(z.string()).describe('Array of dependency entry IDs'),
    unsignedParams: z.array(z.string()).describe('???'),
    privateParams: z.array(z.string()).describe('???'),
    publicParamsMode: z.boolean().describe('Whether public parameters mode is enabled'),
    settings: embedSettingsSchema,
});

export const createEmbedResultSchema = embedSchema;
