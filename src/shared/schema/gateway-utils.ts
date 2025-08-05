import type {Request, Response} from '@gravity-ui/expresskit';
import type {ApiServiceActionConfig, GetAuthHeaders} from '@gravity-ui/gateway';
import type {AppContext} from '@gravity-ui/nodekit';

import type {AuthArgsData} from '../../server/components/gateway-auth-helpers/gateway-auth-helpers';
import {AuthHeader, SERVICE_USER_ACCESS_TOKEN_HEADER} from '../constants';

export const getAuthHeadersNone = () => undefined;

export function createAction<TOutput, TParams = undefined, TTransformed = TOutput>(
    config: ApiServiceActionConfig<AppContext, Request, Response, TOutput, TParams, TTransformed>,
) {
    return config;
}

const createGetAuthHeaders: () => GetAuthHeaders<AuthArgsData> = () => (params) => {
    const {authArgs} = params;

    const resultHeaders = {};

    // zitadel
    if (authArgs?.userAccessToken) {
        Object.assign(resultHeaders, {
            [AuthHeader.Authorization]: `Bearer ${authArgs.userAccessToken}`,
        });
    }
    // zitadel
    if (authArgs?.serviceUserAccessToken) {
        Object.assign(resultHeaders, {
            [SERVICE_USER_ACCESS_TOKEN_HEADER]: authArgs.serviceUserAccessToken,
        });
    }
    // auth
    if (authArgs?.accessToken) {
        Object.assign(resultHeaders, {
            [AuthHeader.Authorization]: `Bearer ${authArgs.accessToken}`,
        });
    }

    return resultHeaders;
};

export const getAuthHeaders: GetAuthHeaders<AuthArgsData> = createGetAuthHeaders();
