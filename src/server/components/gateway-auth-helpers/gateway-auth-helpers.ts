import type {Request, Response} from '@gravity-ui/expresskit';
import type {GetAuthHeaders} from '@gravity-ui/gateway';

import {US_MASTER_TOKEN_HEADER} from '../../../shared/constants/header';

export type AuthArgsData = {
    userAccessToken?: string;
    serviceUserAccessToken?: string;
    accessToken?: string;
    usMasterToken?: string;
};

export const getAuthArgs = (req: Request, _res: Response): AuthArgsData => {
    return {
        // zitadel
        userAccessToken: req.user?.accessToken,
        serviceUserAccessToken: req.serviceUserAccessToken,
        // auth
        accessToken: req.ctx.get('user')?.accessToken,
        // us
        usMasterToken: req.ctx.config.usMasterToken as string,
    };
};

export const getAuthHeadersUSPrivate: GetAuthHeaders<AuthArgsData> = ({authArgs}) => {
    const usMasterToken = authArgs?.usMasterToken as string;
    return {
        [US_MASTER_TOKEN_HEADER]: usMasterToken,
    };
};
