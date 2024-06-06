import type {AppMiddleware} from '@gravity-ui/expresskit';
import type {NodeKit} from '@gravity-ui/nodekit';
import cookieSession from 'cookie-session';
import passport from 'passport';
import type {VerifyCallback} from 'passport-openidconnect';
import OpenIDConnectStrategy from 'passport-openidconnect';

export function initZitadel({
    nodekit,
    beforeAuth,
}: {
    nodekit: NodeKit;
    beforeAuth: AppMiddleware[];
}) {
    if (!nodekit.config.zitadelUri) {
        throw new Error('Missing ZITADEL_URI in env');
    }
    if (!nodekit.config.clientId) {
        throw new Error('Missing CLIENT_ID in env');
    }
    if (!nodekit.config.clientSecret) {
        throw new Error('Missing CLIENT_SECRET in env');
    }
    if (!nodekit.config.appHostUri) {
        throw new Error('Missing APP_HOST_URI in env');
    }
    if (!nodekit.config.zitadelCookieSecret) {
        throw new Error('Missing ZITADEL_COOKIE_SECRET in env');
    }

    passport.use(
        new OpenIDConnectStrategy(
            {
                issuer: nodekit.config.zitadelUri,
                authorizationURL: `${nodekit.config.zitadelUri}/oauth/v2/authorize`,
                tokenURL: `${nodekit.config.zitadelUri}/oauth/v2/token`,
                userInfoURL: `${nodekit.config.zitadelUri}/oidc/v1/userinfo`,
                clientID: nodekit.config.clientId,
                clientSecret: nodekit.config.clientSecret,
                callbackURL: `${nodekit.config.appHostUri}/api/auth/callback`,
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

                const {id, username} = uiProfile as any;

                const login = username;
                const userId = id;

                return done(null, {accessToken, refreshToken, userId, login});
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
            secret: nodekit.config.zitadelCookieSecret,
            path: '/',
            maxAge: 24 * 60 * 60 * 1000 * 365, // 1 year
        }),
    );

    beforeAuth.push(passport.initialize());
    beforeAuth.push(passport.session());
}
