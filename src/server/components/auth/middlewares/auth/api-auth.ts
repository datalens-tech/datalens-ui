import type {NextFunction, Request, Response} from '@gravity-ui/expresskit';
import jwt from 'jsonwebtoken';

import {AUTH_COOKIE_NAME} from '../../../../../shared/components/auth/constants/cookie';
import type {AccessTokenPayload} from '../../types/token';

import {ALGORITHMS} from './constants';

export const apiAuth = async (req: Request, res: Response, next: NextFunction) => {
    req.ctx.log('API_AUTH');

    const authCookie = req.cookies[AUTH_COOKIE_NAME];

    if (!authCookie) {
        req.ctx.logError('API_AUTH_NO_COOKIE');
        res.status(401).send('Unauthorized access');
        return;
    }

    try {
        req.ctx.log('CHECK_ACCESS_TOKEN');

        const {accessToken} = JSON.parse(authCookie);
        const {userId, sessionId, roles} = jwt.verify(
            accessToken,
            req.ctx.config.authTokenPublicKey || '',
            {
                algorithms: ALGORITHMS,
            },
        ) as AccessTokenPayload;

        req.originalContext.set('userId', userId);
        req.originalContext.set('user', {
            userId,
            sessionId,
            accessToken,
            roles,
        });

        req.ctx.log('CHECK_ACCESS_TOKEN_SUCCESS');

        next();
        return;
    } catch (err) {
        req.ctx.logError('CHECK_ACCESS_TOKEN_ERROR', err);
        res.status(401).send('Unauthorized access');
        return;
    }
};
