import type {AppMiddleware} from '@gravity-ui/expresskit';
import {AuthPolicy} from '@gravity-ui/expresskit';
import type {PassportStatic} from 'passport';

import {logout} from '../../controllers/zitadel';
import type {ExtendedAppRouteDescription} from '../../types/controllers';

export function getZitadelRoutes({
    passport,
    beforeAuth,
    afterAuth,
}: {
    passport: PassportStatic;
    beforeAuth: AppMiddleware[];
    afterAuth: AppMiddleware[];
}) {
    const routes: Record<string, ExtendedAppRouteDescription> = {
        auth: {
            beforeAuth,
            afterAuth,
            authHandler: passport.authenticate('openidconnect'),
            route: 'GET /auth',
            handler: () => {},
        },
        authCallback: {
            beforeAuth,
            afterAuth,
            authHandler: passport.authenticate('openidconnect', {
                successRedirect: '/',
                failureRedirect: '/auth',
            }),
            route: 'GET /api/auth/callback',
            handler: () => {},
        },
        logout: {
            beforeAuth,
            afterAuth,
            route: 'GET /logout',
            handler: logout,
            authPolicy: AuthPolicy.disabled,
            ui: true,
        },
    };

    return routes;
}
