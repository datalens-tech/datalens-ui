import type {Request, Response} from '@gravity-ui/expresskit';
import type {GetAuthHeadersParams} from '@gravity-ui/gateway';

import {US_MASTER_TOKEN_HEADER} from '../../../shared/constants/header';

type GetAuthHeaders<AuthArgs = Record<string, unknown>> = (
    params: GetAuthHeadersParams<AuthArgs>,
) => Record<string, string>;

type AuthArgsData = {
    usMasterToken?: string;
};

export const getAuthArgsUSPrivate = ({ctx}: Request, _res: Response): AuthArgsData => {
    const usMasterToken = ctx.config.usMasterToken as string;
    return {
        usMasterToken,
    };
};

export const getAuthHeadersUSPrivate: GetAuthHeaders<AuthArgsData> = ({
    authArgs,
}: {
    serviceName: string;
    authArgs?: AuthArgsData;
    actionType: string;
    requestHeaders: Record<string, string>;
}) => {
    const usMasterToken = authArgs?.usMasterToken as string;
    return {
        [US_MASTER_TOKEN_HEADER]: usMasterToken,
    };
};
