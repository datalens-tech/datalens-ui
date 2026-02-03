import {createAction} from '../../../gateway-utils';
import type {CreateEmbedArgs, CreateEmbedResponse} from '../../types';

export const createEmbed = createAction<CreateEmbedResponse, CreateEmbedArgs>({
    method: 'POST',
    path: () => '/v1/embeds',
    params: (params, headers) => ({
        body: params,
        headers,
    }),
});
