import type {NextFunction, Request, Response} from '@gravity-ui/expresskit';

import {defaultOnFail} from '../callbacks';
import {
    generateServiceAccessUserToken,
    introspect,
    refreshTokens,
    saveUserToLocals,
    saveUserToSession,
} from '../components/zitadel/utils';
import {logout} from '../controllers/zitadel';

async function authZitadel(req: Request, res: Response, next: NextFunction) {
    const {ctx} = req;

    const isAuthenticated = req.isAuthenticated();

    if (isAuthenticated) {
        req.originalContext.set('userId', req.user.userId);

        const serviceUserAccessToken = await generateServiceAccessUserToken(ctx, req.user.userId);
        const accessToken = req.user.accessToken;
        const refreshToken = req.user.refreshToken;

        const zitadelParams = {
            serviceUserAccessToken,
            accessToken,
            refreshToken,
        };

        req.originalContext.set('zitadel', zitadelParams);

        let introspectResult = await introspect(ctx, accessToken);

        if (introspectResult.active) {
            saveUserToLocals(res, introspectResult);
            return next();
        } else {
            const tokensFirstTrial = await refreshTokens(ctx, refreshToken);

            const tokens = {accessToken: undefined, refreshToken: undefined};

            if (tokensFirstTrial.accessToken && tokensFirstTrial.refreshToken) {
                // second trial should be deleted as soon as Zitadel fixes mutliple invalid refresh tokens issuing in parallel: CHARTS-9774
                const tokensSecondTrial = await refreshTokens(ctx, tokensFirstTrial.refreshToken);
                if (tokensSecondTrial.accessToken && tokensSecondTrial.refreshToken) {
                    tokens.accessToken = tokensSecondTrial.accessToken;
                    tokens.refreshToken = tokensSecondTrial.refreshToken;
                }
            }

            if (tokens.accessToken && tokens.refreshToken) {
                req.user.accessToken = tokens.accessToken;
                req.user.refreshToken = tokens.refreshToken;

                zitadelParams.accessToken = tokens.accessToken;
                zitadelParams.refreshToken = tokens.refreshToken;
                req.originalContext.set('zitadel', zitadelParams);

                await saveUserToSession(req);
                introspectResult = await introspect(ctx, req.user.accessToken);

                if (introspectResult.active) {
                    saveUserToLocals(res, introspectResult);
                    return next();
                }
            }

            if (req.routeInfo?.ui) {
                try {
                    return logout(req, res);
                } catch (e) {
                    req.ctx.logError('logout', e);
                    throw e;
                }
            }
            return res.status(498).send('Unauthorized access');
        }
    }

    if (req.path === '/auth' || req.path === '/api/auth/callback') {
        return next();
    }

    const apiRoute = Boolean(!req.routeInfo?.ui);
    if (apiRoute) {
        return res.status(498).send('Unauthorized access');
    }

    return res.redirect('/auth');
}

export default async function (req: Request, res: Response, next: NextFunction) {
    return authZitadel(req, res, next)
        .catch((error) => {
            req.ctx.logError('AUTH_ZITADEL_FAILED', error);
            defaultOnFail(req, res);
        })
        .catch((error) => next(error));
}
