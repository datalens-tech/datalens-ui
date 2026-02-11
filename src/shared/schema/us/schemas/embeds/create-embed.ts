import z from 'zod';

import {embedSchema, embedSettingsSchema} from './embed';

export const createEmbedArgsSchema = z.object({
    title: z.string(),
    embeddingSecretId: z.string(),
    entryId: z.string(),
    depsIds: z.array(z.string()),
    unsignedParams: z.array(z.string()),
    privateParams: z.array(z.string()),
    publicParamsMode: z.boolean(),
    settings: embedSettingsSchema,
});

export const createEmbedResultSchema = embedSchema;
