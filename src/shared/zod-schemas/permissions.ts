import z from 'zod';

export const permissionsSchema = z.object({
    execute: z.boolean(),
    read: z.boolean(),
    edit: z.boolean(),
    admin: z.boolean(),
});
