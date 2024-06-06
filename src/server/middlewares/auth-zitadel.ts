import type {NextFunction, Request, Response} from '@gravity-ui/expresskit';

import {
    generateServiceAccessUserToken,
    introspect,
    refreshTokens,
    saveUserToSesson,
} from '../components/zitadel/utils';
import {logout} from '../controllers/zitadel';

export default async function (req: Request, res: Response, next: NextFunction) {
    const {ctx} = req;

    const isAuthenticated = req.isAuthenticated();

    if (isAuthenticated) {
        req.originalContext.set('userId', req.user.userId);

        req.serviceUserAccessToken = await generateServiceAccessUserToken(ctx, req.user.userId);

        const accessToken = req.user.accessToken;
        const refreshToken = req.user.refreshToken;

        const accessTokenIntrospected = await introspect(ctx, accessToken);

        if (accessTokenIntrospected) {
            return next();
        } else {
            const tokens = await refreshTokens(ctx, refreshToken);

            if (tokens.accessToken && tokens.refreshToken) {
                req.user.accessToken = tokens.accessToken;
                req.user.refreshToken = tokens.refreshToken;

                await saveUserToSesson(req);

                return next();
            } else if (req.routeInfo?.ui) {
                try {
                    return logout(req, res);
                } catch (e) {
                    ctx.logError('logout', e);
                }
            } else {
                return res.status(401).send('Unauthorized access');
            }
        }
    }

    if (req.path === '/auth' || req.path === '/api/auth/callback') {
        return next();
    }

    const apiRoute = Boolean(!req.routeInfo?.ui);
    if (apiRoute) {
        return res.status(401).send('Unauthorized access');
    }

    return res.redirect('/auth');
}
