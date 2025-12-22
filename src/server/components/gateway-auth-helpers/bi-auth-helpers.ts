import type {Request, Response} from '@gravity-ui/expresskit';
import type {GetAuthHeaders} from '@gravity-ui/gateway';

import {
    US_DYNAMIC_MASTER_TOKEN_HEADER,
    US_MASTER_TOKEN_HEADER,
} from '../../../shared/constants/header';
import {Feature} from '../../../shared/types/feature';

type AuthArgsData = {
    usMasterToken?: string;
    usDynamicMasterToken?: string;
};

export const getAuthHeadersBIPrivate: GetAuthHeaders<AuthArgsData> = ({authArgs}) => {
    const usMasterToken = authArgs?.usMasterToken as string;
    return {
        [US_MASTER_TOKEN_HEADER]: usMasterToken,
    };
};

export const hasValidWorkbookTransferAuthHeaders = async (req: Request) => {
    const isEnabledServerFeature = req.ctx.get('isEnabledServerFeature');

    if (isEnabledServerFeature(Feature.UsDynamicMasterTokenInProxy)) {
        return req.headers[US_DYNAMIC_MASTER_TOKEN_HEADER] !== undefined;
    }

    return req.headers[US_MASTER_TOKEN_HEADER] !== undefined;
};

export const getAuthArgsProxyBIPrivate = (
    {ctx, headers}: Request,
    _res: Response,
): AuthArgsData => {
    const isEnabledServerFeature = ctx.get('isEnabledServerFeature');

    if (isEnabledServerFeature(Feature.UsDynamicMasterTokenInProxy)) {
        return {
            usDynamicMasterToken: headers[US_DYNAMIC_MASTER_TOKEN_HEADER] as string,
        };
    }
    return {
        usMasterToken: headers[US_MASTER_TOKEN_HEADER] as string,
    };
};
