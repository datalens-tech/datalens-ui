import z from 'zod/v4';

export const deleteConnectionArgsSchema = z.object({
    connectionId: z.string(),
});

export const deleteConnectionResultSchema = z.unknown();

export const getConnectionArgsSchema = z.object({
    connectionId: z.string(),
    workbookId: z.string().nullable(),
    rev_id: z.string().optional(),
});

const connectionData = z.record(
    z.string(),
    z.union([
        z.string(),
        z.number(),
        z.boolean(),
        z.array(z.unknown()),
        z.null(),
        z.undefined(),
        z.record(z.string(), z.unknown()),
    ]),
);

export const getConnectionResultSchema = connectionData;
