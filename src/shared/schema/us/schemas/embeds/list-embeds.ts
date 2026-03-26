import z from 'zod';

import {registerComponentId} from '../../../../components/public-api/utils';

import {embedSchema} from './embed';

export const listEmbedsArgsSchema = z
    .object({
        entryId: z.string().describe('ID of the entry to list embeddings for.'),
    })
    .openapi(registerComponentId('ListEmbedsArgs'), {
        title: 'ListEmbedsArgs',
    });

export const listEmbedsResultSchema = z.array(embedSchema).describe('Array of embeddings.');
