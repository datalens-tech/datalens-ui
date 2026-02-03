import {createAction} from '../../../gateway-utils';
import type {DeleteEmbedArgs, DeleteEmbedResponse} from '../../types';

export const deleteEmbed = createAction<DeleteEmbedResponse, DeleteEmbedArgs>({
    method: 'DELETE',
    path: ({embedId}) => `/v1/embeds/${embedId}`,
    params: (_, headers) => ({
        headers,
    }),
});
