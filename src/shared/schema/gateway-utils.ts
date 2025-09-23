import type {Request, Response} from '@gravity-ui/expresskit';
import type {ApiServiceActionConfig, GetAuthHeaders} from '@gravity-ui/gateway';
import type {AppContext} from '@gravity-ui/nodekit';
import type z from 'zod/v4';

import {AuthHeader, SERVICE_USER_ACCESS_TOKEN_HEADER} from '../constants';

export const getAuthHeadersNone = () => undefined;

export function createAction<TOutput, TParams = undefined, TTransformed = TOutput>(
    config: ApiServiceActionConfig<AppContext, Request, Response, TOutput, TParams, TTransformed>,
) {
    return config;
}

export function createTypedAction<TOutputSchema extends z.ZodType, TParamsSchema extends z.ZodType>(
    _: {paramsSchema: TParamsSchema; resultSchema: TOutputSchema},
    actionConfig: ApiServiceActionConfig<
        AppContext,
        Request,
        Response,
        z.infer<TOutputSchema>,
        z.infer<TParamsSchema>,
        z.infer<TOutputSchema>
    >,
) {
    return actionConfig;
}

type AuthArgsData = {
    userAccessToken?: string;
    serviceUserAccessToken?: string;
    accessToken?: string;
};

export const getAuthArgs = (req: Request, _res: Response): AuthArgsData => {
    return {
        // zitadel
        userAccessToken: req.user?.accessToken,
        serviceUserAccessToken: req.serviceUserAccessToken,
        // auth
        accessToken: req.ctx.get('user')?.accessToken,
    };
};

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
