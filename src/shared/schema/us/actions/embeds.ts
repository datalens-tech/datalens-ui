import {createAction} from '../../gateway-utils';
import type {
    CreateEmbedArgs,
    CreateEmbedResponse,
    DeleteEmbedArgs,
    DeleteEmbedResponse,
    ListEmbedsArgs,
    ListEmbedsResponse,
} from '../types';

const EMBEDS_PATH_PREFIX = '/v1/embeds';

export const embedsActions = {
    createEmbed: createAction<CreateEmbedResponse, CreateEmbedArgs>({
        method: 'POST',
        path: () => EMBEDS_PATH_PREFIX,
        params: (params, headers) => ({
            body: params,
            headers,
        }),
    }),

    listEmbeds: createAction<ListEmbedsResponse, ListEmbedsArgs>({
        method: 'GET',
        path: () => EMBEDS_PATH_PREFIX,
        params: ({entryId}, headers) => ({
            query: {entryId},
            headers,
        }),
    }),

    deleteEmbed: createAction<DeleteEmbedResponse, DeleteEmbedArgs>({
        method: 'DELETE',
        path: ({embedId}) => `${EMBEDS_PATH_PREFIX}/${embedId}`,
        params: (_, headers) => ({
            headers,
        }),
    }),
};
