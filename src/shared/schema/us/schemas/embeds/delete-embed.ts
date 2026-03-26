import z from 'zod';

import {registerComponentId} from '../../../../components/public-api/utils';

export const deleteEmbedArgsSchema = z
    .object({
        embedId: z.string().describe('ID of the embedding to delete.'),
    })
    .openapi(registerComponentId('DeleteEmbedArgs'), {
        title: 'DeleteEmbedArgs',
    });

export const deleteEmbedResultSchema = z
    .object({
        embedId: z.string().describe('ID of the deleted embedding.'),
    })
    .openapi(registerComponentId('DeleteEmbedResult'), {
        title: 'DeleteEmbedResult',
    });
