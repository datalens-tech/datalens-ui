import {createTypedAction} from '../../../gateway-utils';
import {listEmbedsArgsSchema, listEmbedsResultSchema} from '../../schemas/embeds';

export const listEmbeds = createTypedAction(
    {
        paramsSchema: listEmbedsArgsSchema,
        resultSchema: listEmbedsResultSchema,
    },
    {
        method: 'GET',
        path: () => '/v1/embeds',
        params: ({entryId}, headers) => ({
            query: {entryId},
            headers,
        }),
    },
);
