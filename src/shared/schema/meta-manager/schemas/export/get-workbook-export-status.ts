import z from 'zod';

import {entryNotificationSchema, processStatusSchema} from '../common';

export const getWorkbookExportStatusArgsSchema = z.object({
    exportId: z.string(),
});

export const getWorkbookExportStatusResultSchema = z.object({
    exportId: z.string(),
    status: processStatusSchema,
    progress: z.number(),
    notifications: z.array(entryNotificationSchema).nullable().optional(),
});
