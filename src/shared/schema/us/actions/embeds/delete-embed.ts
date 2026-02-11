import {createTypedAction} from '../../../gateway-utils';
import {deleteEmbedArgsSchema, deleteEmbedResultSchema} from '../../schemas/embeds';

export const deleteEmbed = createTypedAction(
    {
        paramsSchema: deleteEmbedArgsSchema,
        resultSchema: deleteEmbedResultSchema,
    },
    {
        method: 'DELETE',
        path: ({embedId}) => `/v1/embeds/${embedId}`,
        params: (_, headers) => ({
            headers,
        }),
    },
);
