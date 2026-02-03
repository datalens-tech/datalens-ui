import {createAction} from '../../../gateway-utils';
import type {UpdateEmbedUsageResponse} from '../../types';

export const _updateEmbedUsage = createAction<UpdateEmbedUsageResponse>({
    method: 'POST',
    path: () => `/private/v1/embeds/usage`,
    params: (_, headers) => ({
        headers,
    }),
});
