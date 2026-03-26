import type z from 'zod';

import type {
    getWorkbookExportResultResultSchema,
    getWorkbookExportStatusResultSchema,
    startWorkbookExportResultSchema,
} from '../schemas/export';

export type StartWorkbookExportResponse = z.infer<typeof startWorkbookExportResultSchema>;

export type GetWorkbookExportStatusResponse = z.infer<typeof getWorkbookExportStatusResultSchema>;

export type GetWorkbookExportResultResponse = z.infer<typeof getWorkbookExportResultResultSchema>;
