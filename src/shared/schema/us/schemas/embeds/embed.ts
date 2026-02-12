import z from 'zod';

export const embedSettingsSchema = z.object({
    enableExport: z.boolean().optional(),
});

export const embedSchema = z.object({
    embedId: z.string(),
    title: z.string(),
    embeddingSecretId: z.string(),
    entryId: z.string(),
    depsIds: z.array(z.string()),
    unsignedParams: z.array(z.string()),
    privateParams: z.array(z.string()),
    createdBy: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    updatedBy: z.string(),
    publicParamsMode: z.boolean(),
    settings: embedSettingsSchema,
});
