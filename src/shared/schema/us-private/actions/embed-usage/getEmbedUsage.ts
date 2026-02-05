import {createAction} from '../../../gateway-utils';
import type {GetEmbedUsageResponse} from '../../../us/types';

export const _getEmbedUsage = createAction<GetEmbedUsageResponse>({
    method: 'GET',
    path: () => `/private/v1/embed-usage`,
    params: (_, headers) => ({
        headers,
    }),
});
