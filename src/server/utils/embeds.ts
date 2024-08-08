import type {Request, Response} from '@gravity-ui/expresskit';
import type {AppContext} from '@gravity-ui/nodekit';
import jwt from 'jsonwebtoken';

import {DL_EMBED_TOKEN_HEADER} from '../../shared/constants';

export const validateAndGetEmbeddedData = (req: Request, res: Response, ctx: AppContext) => {
    const embedToken = Array.isArray(req.headers[DL_EMBED_TOKEN_HEADER])
        ? ''
        : req.headers[DL_EMBED_TOKEN_HEADER];

    if (!embedToken) {
        ctx.log('CHARTS_ENGINE_NO_TOKEN');
        return {status: 400, error: 'You must provide embedToken'};
    }

    const payload = jwt.decode(embedToken);

    if (!payload || typeof payload === 'string' || !('embedId' in payload)) {
        ctx.log('CHARTS_ENGINE_WRONG_TOKEN');
        return {
            status: 400,
            error: {
                code: 'ERR.CHARTS.WRONG_EMBED_TOKEN',
                extra: {message: 'Wrong token format', hideRetry: true},
            },
        };
    }

    return {payload, embedToken};
};
