import z from 'zod';

import {entryNotificationSchema, processStatusSchema} from '../common';

export const getWorkbookImportStatusArgsSchema = z.object({
    importId: z.string(),
});

export const getWorkbookImportStatusResultSchema = z.object({
    importId: z.string(),
    workbookId: z.string(),
    status: processStatusSchema,
    progress: z.number(),
    notifications: z.array(entryNotificationSchema).nullable(),
});
