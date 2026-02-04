import z from 'zod';

import {WORKBOOK_STATUS} from '../../../../constants/workbooks';

export const workbookSchema = z.object({
    workbookId: z.string(),
    collectionId: z.string().nullable(),
    title: z.string(),
    description: z.string().nullable(),
    tenantId: z.string(),
    meta: z
        .object({
            importId: z.string().optional(),
        })
        .and(z.record(z.string(), z.unknown())),
    createdBy: z.string(),
    createdAt: z.string(),
    updatedBy: z.string(),
    updatedAt: z.string(),
    status: z.enum(WORKBOOK_STATUS).optional(),
});

export const workbookPermissionsSchema = z.object({
    listAccessBindings: z.boolean(),
    updateAccessBindings: z.boolean(),
    limitedView: z.boolean(),
    view: z.boolean(),
    update: z.boolean(),
    copy: z.boolean(),
    move: z.boolean(),
    publish: z.boolean(),
    embed: z.boolean(),
    delete: z.boolean(),
});
