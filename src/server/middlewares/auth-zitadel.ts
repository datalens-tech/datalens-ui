import {NextFunction, Request, Response} from '@gravity-ui/expresskit';

import {logout} from '../controllers/zitadel';
import {
    generateServiceUserToken,
    introspect,
    refreshTokens,
    saveUserToSesson,
} from '../utils/zitadel';

export default async function (req: Request, res: Response, next: NextFunction) {
    const {ctx} = req;

    const isAuthenticated = req.isAuthenticated();

    if (isAuthenticated) {
        req.userAccessToken = await generateServiceUserToken(ctx);

        const accessTokenIntrospected = await introspect(ctx, req.user?.accessToken);

        if (accessTokenIntrospected) {
            return next();
        } else {
            const tokens = await refreshTokens(ctx, (req.user as any).refreshToken);

            if (tokens.accessToken && tokens.refreshToken) {
                (req.user as any).accessToken = tokens.accessToken;
                (req.user as any).refreshToken = tokens.refreshToken;

                await saveUserToSesson(req);

                return next();
            } else {
                return logout(req, res);
            }
        }
    }

    if (req.path === '/auth' || req.path === '/api/auth/callback') {
        return next();
    }

    const apiRoute = Boolean(!(req.routeInfo as any).ui);
    if (apiRoute) {
        return res.status(401).send('Unauthorized access');
    }

    return res.redirect('/auth');
}
