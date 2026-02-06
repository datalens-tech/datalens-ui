import z from 'zod';

export const embedSchema = z.object({
    embedId: z.string().describe('Unique identifier of the embed'),
    title: z.string().describe('Title of the embed'),
    embeddingSecretId: z.string().describe('ID of the embedding secret used for authentication'),
    entryId: z.string().describe('ID of the entry being embedded'),
    depsIds: z.array(z.string()).describe('Array of dependency entry IDs'),
    unsignedParams: z
        .array(z.string())
        .describe('Array of parameter names that can be passed unsigned'),
    privateParams: z.array(z.string()).describe('Array of parameter names that are private'),
    createdBy: z.string().describe('User ID who created the embed'),
    createdAt: z.string().describe('Timestamp when the embed was created'),
    updatedAt: z.string().describe('Timestamp when the embed was last updated'),
    updatedBy: z.string().describe('User ID who last updated the embed'),
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
