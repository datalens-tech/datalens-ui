import {createAction} from '../../../gateway-utils';
import type {GetEmbedUsageResponse} from '../../types';

export const getEmbedUsage = createAction<GetEmbedUsageResponse>({
    method: 'GET',
    path: () => `/v1/embeds/usage`,
    params: (_, headers) => ({
        headers,
    }),
});
