import {createAction} from '../../../gateway-utils';
import type {ListEmbedsArgs, ListEmbedsResponse} from '../../types';

export const listEmbeds = createAction<ListEmbedsResponse, ListEmbedsArgs>({
    method: 'GET',
    path: () => '/v1/embeds',
    params: ({entryId}, headers) => ({
        query: {entryId},
        headers,
    }),
});
