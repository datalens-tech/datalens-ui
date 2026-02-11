import z from 'zod';

import {embedSchema} from './embed';

export const listEmbedsArgsSchema = z.object({
    entryId: z.string(),
});

export const listEmbedsResultSchema = z.array(embedSchema);
