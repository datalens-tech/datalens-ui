import type z from 'zod';

import type {
    getWorkbookImportStatusResultSchema,
    startWorkbookImportResultSchema,
} from '../schemas/import';

export type StartWorkbookImportResponse = z.infer<typeof startWorkbookImportResultSchema>;

export type GetWorkbookImportStatusResponse = z.infer<typeof getWorkbookImportStatusResultSchema>;
