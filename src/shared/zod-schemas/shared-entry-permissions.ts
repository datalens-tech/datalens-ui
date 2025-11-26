import z from 'zod';

export const sharedEntryPermissionsSchema = z.object({
    listAccessBindings: z.boolean(),
    updateAccessBindings: z.boolean(),
    limitedView: z.boolean(),
    view: z.boolean(),
    update: z.boolean(),
    copy: z.boolean(),
    move: z.boolean(),
    delete: z.boolean(),
    createEntryBinding: z.boolean(),
    createLimitedEntryBinding: z.boolean(),
});
