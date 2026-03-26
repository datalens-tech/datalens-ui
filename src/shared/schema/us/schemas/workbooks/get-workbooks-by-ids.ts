import z from 'zod';

import {workbookSchema} from './index';

export const getWorkbooksByIdsArgsSchema = z.object({
    workbookIds: z.array(z.string()).min(1).max(1000),
});

export const getWorkbooksByIdsResultSchema = z.array(workbookSchema);
