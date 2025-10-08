import z from 'zod';

export const deleteConnectionArgsSchema = z.object({
    connectionId: z.string(),
});

export const deleteConnectionResultSchema = z.unknown();

export const getConnectionArgsSchema = z.object({
    connectionId: z.string(),
    workbookId: z.string().nullable(),
});

const connectionData = z.record(
    z.string(),
    z
        .union([
            z.string(),
            z.number(),
            z.boolean(),
            z.array(z.unknown()),
            z.null(),
            z.record(z.string(), z.unknown()),
        ])
        .optional(),
);

export const getConnectionResultSchema = connectionData;
