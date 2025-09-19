import type {Request, Response} from '@gravity-ui/expresskit';
import type {GetAuthHeaders} from '@gravity-ui/gateway';

import {US_MASTER_TOKEN_HEADER} from '../../../constants/header';

type AuthArgsData = {
    usMasterToken?: string;
};

export const getAuthArgsUSPrivate = ({ctx}: Request, _res: Response): AuthArgsData => {
    const usMasterToken = ctx.config.usMasterToken as string;
    return {
        usMasterToken,
    };
};

export const getAuthHeadersUSPrivate: GetAuthHeaders<AuthArgsData> = ({authArgs}) => {
    const usMasterToken = authArgs?.usMasterToken as string;
    return {
        [US_MASTER_TOKEN_HEADER]: usMasterToken,
    };
};

export const getAuthArgsProxyBiPrivate = (req: Request, _res: Response): AuthArgsData => {
    return {
        usMasterToken: req.headers[US_MASTER_TOKEN_HEADER] as string,
    };
};
