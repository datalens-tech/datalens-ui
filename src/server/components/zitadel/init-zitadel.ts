import type {AppMiddleware} from '@gravity-ui/expresskit';
import cookieSession from 'cookie-session';
import passport from 'passport';
import type {VerifyCallback} from 'passport-openidconnect';
import OpenIDConnectStrategy from 'passport-openidconnect';

import {appHostUri, clientId, clientSecret, zitadelCookieSecret, zitadelUri} from '../../app-env';

export function initZitadel({beforeAuth}: {beforeAuth: AppMiddleware[]}) {
    if (!zitadelUri) {
        throw new Error('Missing ZITADEL_URI in env');
    }
    if (!clientId) {
        throw new Error('Missing CLIENT_ID in env');
    }
    if (!clientSecret) {
        throw new Error('Missing CLIENT_SECRET in env');
    }
    if (!appHostUri) {
        throw new Error('Missing APP_HOST_URI in env');
    }
    if (!zitadelCookieSecret) {
        throw new Error('Missing ZITADEL_COOKIE_SECRET in env');
    }

    passport.use(
        new OpenIDConnectStrategy(
            {
                issuer: zitadelUri,
                authorizationURL: `${zitadelUri}/oauth/v2/authorize`,
                tokenURL: `${zitadelUri}/oauth/v2/token`,
                userInfoURL: `${zitadelUri}/oidc/v1/userinfo`,
                clientID: clientId,
                clientSecret: clientSecret,
                callbackURL: `${appHostUri}/api/auth/callback`,
                scope: [
                    'openid',
                    'profile',
                    'email',
                    'offline_access',
                    'urn:zitadel:iam:org:project:id:zitadel:aud',
                ],
                prompt: '1',
            },
            (
                _issuer: string,
                uiProfile: object,
                _idProfile: object,
                _context: object,
                _idToken: string | object,
                accessToken: string | object,
                refreshToken: string,
                _params: unknown,
                done: VerifyCallback,
            ) => {
                if (typeof accessToken !== 'string') {
                    throw new Error('Incorrect type of accessToken');
                }

                const {id, emails, username, displayName} = uiProfile as any;

                const email = emails?.length > 0 ? emails[0] : undefined;
                const login = username;
                const userName = displayName;
                const userId = id;

                return done(null, {accessToken, refreshToken, userId, login, email, userName});
            },
        ),
    );

    passport.serializeUser((user: Express.User | null | undefined, done) => {
        done(null, user);
    });

    passport.deserializeUser(function (user: Express.User | null | undefined, done): void {
        done(null, user);
    });

    beforeAuth.push(
        cookieSession({
            name: 'zitadelCookie',
            secret: zitadelCookieSecret,
            path: '/',
            maxAge: 24 * 60 * 60 * 1000 * 365, // 1 year
        }),
    );

    beforeAuth.push(passport.initialize());
    beforeAuth.push(passport.session());
}
