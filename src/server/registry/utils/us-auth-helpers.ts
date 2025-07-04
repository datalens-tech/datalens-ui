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

export const privateRouteMiddleware = (req: Request, res: Response, next: () => void) => {
    const requestMasterToken = req.headers[US_MASTER_TOKEN_HEADER] as string;

    const usMasterToken = req.ctx.config.usMasterToken as string;

    if (!usMasterToken || usMasterToken.length === 0) {
        res.status(403).send({error: 'No master token in config'});
        return;
    }

    if (!requestMasterToken || usMasterToken !== requestMasterToken) {
        req.ctx.log('PRIVATE_API_CALL_DENIED');

        res.status(403).send({error: 'Private API call denied'});
        return;
    }

    next();
};
