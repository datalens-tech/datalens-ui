import z from 'zod';

import {embedSchema} from './embed';

export const listEmbedsArgsSchema = z.object({
    entryId: z.string().describe('ID of the entry to list embeds for'),
});

export const listEmbedsResultSchema = z.array(embedSchema).describe('Array of embeds');
