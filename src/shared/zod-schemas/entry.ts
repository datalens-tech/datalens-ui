import z from 'zod/v4';

export const ENTRY_SCHEMAS = {
    entryId: z.string(),
    createdAt: z.string(),
    createdBy: z.string(),
    updatedAt: z.string(),
    updatedBy: z.string(),
    annotation: z
        .object({
            description: z.string().optional(),
        })
        .nullable()
        .optional(),
};
