import z from 'zod';

export const collectionPermissionsSchema = z.object({
    listAccessBindings: z.boolean(),
    updateAccessBindings: z.boolean(),
    createSharedEntry: z.boolean(),
    createCollection: z.boolean(),
    createWorkbook: z.boolean(),
    limitedView: z.boolean(),
    view: z.boolean(),
    update: z.boolean(),
    copy: z.boolean(),
    move: z.boolean(),
    delete: z.boolean(),
});

export const collectionSchema = z.object({
    collectionId: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    parentId: z.string().nullable(),
    projectId: z.string().nullable(),
    tenantId: z.string(),
    createdBy: z.string(),
    createdAt: z.string(),
    updatedBy: z.string(),
    updatedAt: z.string(),
    meta: z.record(z.string(), z.unknown()),
});
