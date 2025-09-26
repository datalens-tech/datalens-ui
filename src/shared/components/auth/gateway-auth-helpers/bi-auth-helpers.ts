import type {Request, Response} from '@gravity-ui/expresskit';
import type {GetAuthHeaders} from '@gravity-ui/gateway';

import {US_MASTER_TOKEN_HEADER} from '../../../constants/header';

type AuthArgsData = {
    usMasterToken?: string;
};

export const getAuthHeadersBIPrivate: GetAuthHeaders<AuthArgsData> = ({authArgs}) => {
    const usMasterToken = authArgs?.usMasterToken as string;
    return {
        [US_MASTER_TOKEN_HEADER]: usMasterToken,
    };
};

export const hasValidWorkbookTransferAuthHeaders = async (req: Request) => {
    return req.headers[US_MASTER_TOKEN_HEADER] !== undefined;
};

export const getAuthArgsProxyBIPrivate = (req: Request, _res: Response): AuthArgsData => {
    return {
        usMasterToken: req.headers[US_MASTER_TOKEN_HEADER] as string,
    };
};
