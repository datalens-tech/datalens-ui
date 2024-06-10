import type {Request, Response} from '@gravity-ui/expresskit';
import type {ApiServiceActionConfig, GetAuthHeaders} from '@gravity-ui/gateway';
import type {AppContext} from '@gravity-ui/nodekit';

import {SERVICE_USER_ACCESS_TOKEN_HEADER} from '../constants';

export const getAuthHeadersNone = () => undefined;

export function createAction<TOutput, TParams = undefined, TTransformed = TOutput>(
    config: ApiServiceActionConfig<AppContext, Request, Response, TOutput, TParams, TTransformed>,
) {
    return config;
}

type AuthArgsData = {
    userAccessToken?: string;
    serviceUserAccessToken?: string;
};

export const getAuthArgs = (req: Request, _res: Response): AuthArgsData => {
    return {
        userAccessToken: req.user?.accessToken,
        serviceUserAccessToken: req.serviceUserAccessToken,
    };
};

const createGetAuthHeaders: () => GetAuthHeaders<AuthArgsData> = () => (params) => {
    const {authArgs} = params;

    const resultHeaders = {};

    if (authArgs?.userAccessToken) {
        Object.assign(resultHeaders, {authorization: `Bearer ${authArgs?.userAccessToken}`});
    }

    if (authArgs?.serviceUserAccessToken) {
        Object.assign(resultHeaders, {
            [SERVICE_USER_ACCESS_TOKEN_HEADER]: authArgs?.serviceUserAccessToken,
        });
    }

    return resultHeaders;
};

export const getAuthHeaders: GetAuthHeaders<AuthArgsData> = createGetAuthHeaders();
