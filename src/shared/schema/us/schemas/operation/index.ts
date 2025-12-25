import z from 'zod';

const timeSchema = z.object({
    seconds: z.string(),
    nanos: z.number().optional(),
});

export const datalensOperationSchema = z.object({
    id: z.string(),
    description: z.string(),
    createdBy: z.string(),
    createdAt: timeSchema,
    modifiedAt: timeSchema,
    metadata: z.object({}),
    done: z.boolean(),
});
