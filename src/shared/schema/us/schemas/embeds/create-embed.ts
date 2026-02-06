import z from 'zod';

import {embedSchema} from './embed';

export const createEmbedArgsSchema = z.object({
    title: z.string().describe('Title of the embed'),
    embeddingSecretId: z.string().describe('ID of the embedding secret used for authentication'),
    entryId: z.string().describe('ID of the entry to be embedded'),
    depsIds: z.array(z.string()).describe('Array of dependency entry IDs'),
    unsignedParams: z
        .array(z.string())
        .describe('Array of parameter names that can be passed unsigned'),
    privateParams: z.array(z.string()).describe('Array of parameter names that are private'),
    publicParamsMode: z.boolean().describe('Whether public parameters mode is enabled'),
    settings: z
        .object({
            enableExport: z
                .boolean()
                .optional()
                .describe('Whether export is enabled for the embed'),
        })
        .describe('Embed settings'),
});

export const createEmbedResultSchema = embedSchema;
