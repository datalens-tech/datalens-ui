import z from 'zod';

import {processStatusSchema} from '../common';

export const getWorkbookExportResultArgsSchema = z.object({
    exportId: z.string(),
});

export const getWorkbookExportResultResultSchema = z.object({
    exportId: z.string(),
    data: z.object({
        export: z.record(z.string(), z.unknown()),
        hash: z.string(),
    }),
    status: processStatusSchema,
});
