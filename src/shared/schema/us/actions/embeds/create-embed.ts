import {createTypedAction} from '../../../gateway-utils';
import {createEmbedArgsSchema, createEmbedResultSchema} from '../../schemas/embeds';

export const createEmbed = createTypedAction(
    {
        paramsSchema: createEmbedArgsSchema,
        resultSchema: createEmbedResultSchema,
    },
    {
        method: 'POST',
        path: () => '/v1/embeds',
        params: (params, headers) => ({
            body: params,
            headers,
        }),
    },
);
