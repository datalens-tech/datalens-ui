import type {NextFunction, Request, Response} from '@gravity-ui/expresskit';
import jwt from 'jsonwebtoken';
import requestIp from 'request-ip';
import setCookieParser from 'set-cookie-parser';

import {
    AUTH_COOKIE_NAME,
    AUTH_EXP_COOKIE_NAME,
} from '../../../../../shared/components/auth/constants/cookie';
import {ACCESS_TOKEN_TIME_RESERVE} from '../../../../../shared/components/auth/constants/token';
import {RELOADED_URL_QUERY} from '../../../../../shared/components/auth/constants/url';
import {
    AuthHeader,
    FORWARDED_FOR_HEADER,
    SET_COOKIE_HEADER,
} from '../../../../../shared/constants/header';
import {isTrueArg} from '../../../../../shared/modules/url';
import {onFail} from '../../../../callbacks';
import {registry} from '../../../../registry';
import type {DatalensGatewaySchemas} from '../../../../types/gateway';
import {isGatewayError} from '../../../../utils/gateway';
import {onAuthLogout, onAuthReload, onAuthSignin} from '../../callbacks';
import type {AccessTokenPayload} from '../../types/token';

import {ALGORITHMS} from './constants';

export const uiAuth = async (req: Request, res: Response, next: NextFunction) => {
    req.ctx.log('UI_AUTH');

    let authCookie = req.cookies[AUTH_COOKIE_NAME];
    let authExpCookie = req.cookies[AUTH_EXP_COOKIE_NAME];

    if (!authCookie || !authExpCookie) {
        req.ctx.log('SIGNIN');
        onAuthSignin(req, res);
        return;
    }

    const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();

    const now = Math.floor(new Date().getTime() / 1000);
    const exp = Number(authExpCookie);

    if (now + ACCESS_TOKEN_TIME_RESERVE > exp) {
        req.ctx.log('START_REFRESH_TOKEN', {
            now,
            exp,
        });

        try {
            await gatewayApi.auth.auth
                .refreshTokens({
                    ctx: req.ctx,
                    headers: {
                        [AuthHeader.Cookie]: req.headers.cookie,
                        [FORWARDED_FOR_HEADER]: requestIp.getClientIp(req) ?? undefined,
                    },
                    authArgs: {},
                    requestId: req.ctx.get('requestId') ?? '',
                    args: undefined,
                })
                .then((result) => {
                    const {responseHeaders} = result;

                    if (responseHeaders) {
                        Object.keys(responseHeaders).forEach((header) => {
                            if (header.toLowerCase() === SET_COOKIE_HEADER.toLowerCase()) {
                                res.header(header, responseHeaders[header]);

                                const settedCookies = setCookieParser.parse(
                                    responseHeaders[header],
                                );

                                settedCookies.forEach((cookie) => {
                                    if (cookie.name === AUTH_COOKIE_NAME) {
                                        authCookie = cookie.value;
                                    } else if (cookie.name === AUTH_EXP_COOKIE_NAME) {
                                        authExpCookie = cookie.value;
                                    }
                                });
                            }
                        });
                    }

                    req.ctx.log('FINISH_REFRESH_TOKEN', {
                        newExp: Number(authExpCookie),
                    });
                });
        } catch (err) {
            req.ctx.logError('REFRESH_TOKEN_ERROR', isGatewayError(err) ? err.error : err);
            if (isTrueArg(req.query[RELOADED_URL_QUERY])) {
                onAuthLogout(req, res);
            } else {
                onAuthReload(req, res);
            }
            return;
        }
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
    } catch (err) {
        req.ctx.logError('CHECK_ACCESS_TOKEN_ERROR', err);
        onFail(req, res);
        return;
    }

    next();
};
