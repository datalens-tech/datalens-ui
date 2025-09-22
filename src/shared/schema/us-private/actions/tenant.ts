import {createAction} from '../../gateway-utils';
import type {GetTenantDetailsArgs, GetTenantDetailsResponse} from '../../us/types';

const PRIVATE_PATH_PREFIX = '/private';

export const tenantActions = {
    _getTenantDetails: createAction<GetTenantDetailsResponse, GetTenantDetailsArgs>({
        method: 'GET',
        path: ({tenantId}) => `${PRIVATE_PATH_PREFIX}/tenants/${tenantId}/details`,
        params: (_, headers) => ({
            headers,
        }),
    }),
};
