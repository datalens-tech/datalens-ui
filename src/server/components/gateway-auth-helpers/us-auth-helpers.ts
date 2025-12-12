import type {Request, Response} from '@gravity-ui/expresskit';
import type {GetAuthHeaders} from '@gravity-ui/gateway';

import {
    US_DYNAMIC_MASTER_TOKEN_HEADER,
    US_MASTER_TOKEN_HEADER,
} from '../../../shared/constants/header';

type AuthArgsData = {
    usMasterToken?: string;
    usDynamicMasterToken?: string;
};

export const getAuthArgsUSPrivate = ({ctx}: Request, _res: Response): AuthArgsData => {
    const usDynamicMasterToken = ctx.get('usDynamicMasterToken');

    if (usDynamicMasterToken) {
        return {
            usDynamicMasterToken,
        };
    }

    return {
        usMasterToken: ctx.config.usMasterToken as string,
    };
};

export const getAuthHeadersUSPrivate: GetAuthHeaders<AuthArgsData> = ({authArgs}) => {
    const {usMasterToken, usDynamicMasterToken} = authArgs || {};

    return {
        ...(usMasterToken && {[US_MASTER_TOKEN_HEADER]: usMasterToken}),
        ...(usDynamicMasterToken && {[US_DYNAMIC_MASTER_TOKEN_HEADER]: usDynamicMasterToken}),
    };
};

export const getAuthArgsProxyUSPrivate = (req: Request, _res: Response): AuthArgsData => {
    return {
        usMasterToken: req.headers[US_MASTER_TOKEN_HEADER] as string,
        usDynamicMasterToken: req.headers[US_DYNAMIC_MASTER_TOKEN_HEADER] as string,
    };
};
