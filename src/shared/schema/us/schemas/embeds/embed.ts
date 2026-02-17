import z from 'zod';

export const embedSettingsSchema = z.object({
    enableExport: z
        .boolean()
        .optional()
        .describe('Whether data export is enabled for the embedding.'),
});

export const embedSchema = z.object({
    embedId: z.string().describe('Unique identifier of the embedding.'),
    title: z.string().describe('Name of the embedding.'),
    embeddingSecretId: z.string().describe('ID of the key for embedding used for authentication.'),
    entryId: z.string().describe('ID of the entry being privately embedded.'),
    depsIds: z.array(z.string()).describe('Array of dependency entry IDs.'),
    unsignedParams: z
        .array(z.string())
        .describe('Array of unsigned parameters to be provided in the embedding link.'),
    privateParams: z
        .array(z.string())
        .describe('Array of signed parameters that are provided as part of the token.'),
    createdBy: z.string().describe('ID of the user who created the embedding.'),
    createdAt: z.string().describe('Timestamp when the embedding was created.'),
    updatedAt: z.string().describe('Timestamp when the embedding was last updated.'),
    updatedBy: z.string().describe('ID of the user who was the last to update the embedding.'),
    publicParamsMode: z.boolean().describe('Whether default parameters mode is enabled.'),
    settings: embedSettingsSchema,
});
