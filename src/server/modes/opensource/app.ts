import {AppMiddleware, AppRoutes, AuthPolicy, ExpressKit} from '@gravity-ui/expresskit';
import {NodeKit} from '@gravity-ui/nodekit';
import cookieSession from 'cookie-session';
import passport from 'passport';
import OpenIDConnectStrategy, {VerifyCallback} from 'passport-openidconnect';

import {DASH_API_BASE_URL, PUBLIC_API_DASH_API_BASE_URL} from '../../../shared';
import {
    appHostUri,
    clientId,
    clientSecret,
    cookieSecret,
    isChartsMode,
    isDatalensMode,
    isFullMode,
    isZitadelEnabled,
    zitadelUri,
} from '../../app-env';
import {getAppLayoutSettings} from '../../components/app-layout/app-layout-settings';
import {createLayoutPlugin} from '../../components/app-layout/plugins/layout';
import {ChartsEngine} from '../../components/charts-engine';
import {xlsxConverter} from '../../controllers/xlsx-converter';
import {
    beforeAuthDefaults,
    createAppLayoutMiddleware,
    getCtxMiddleware,
    patchLogger,
    xDlContext,
} from '../../middlewares';
import {registry} from '../../registry';
import {initChartsEngine} from '../charts/init-charts-engine';
import {configuredDashApiPlugin} from '../charts/plugins/dash-api';
import {plugin as ql} from '../charts/plugins/ql';
import {configurableRequestWithDatasetPlugin} from '../charts/plugins/request-with-dataset';

import {setSubrequestHeaders} from './middlewares';
import {getRoutes} from './routes';

export default function initApp(nodekit: NodeKit) {
    const beforeAuth: AppMiddleware[] = [];
    const afterAuth: AppMiddleware[] = [];

    registry.setupXlsxConverter(xlsxConverter);

    if (isZitadelEnabled) {
        initZitadel({beforeAuth});
    }

    if (isFullMode || isDatalensMode) {
        initDataLensApp({beforeAuth, afterAuth});
    }

    let chartsEngine: ChartsEngine | undefined;

    if (isFullMode || isChartsMode) {
        chartsEngine = initChartsApp({nodekit, beforeAuth, afterAuth});
    }

    const extendedRoutes = getRoutes({
        ctx: nodekit.ctx,
        chartsEngine,
        passport,
        beforeAuth,
        afterAuth,
    });

    const routes: AppRoutes = {};
    Object.keys(extendedRoutes).forEach((key) => {
        const {route, ...params} = extendedRoutes[key];
        routes[route] = params;
    });

    return new ExpressKit(nodekit, routes);
}

function initDataLensApp({
    beforeAuth,
    afterAuth,
}: {
    beforeAuth: AppMiddleware[];
    afterAuth: AppMiddleware[];
}) {
    beforeAuth.push(
        createAppLayoutMiddleware({plugins: [createLayoutPlugin()], getAppLayoutSettings}),
        beforeAuthDefaults,
    );

    afterAuth.push(xDlContext(), getCtxMiddleware());
}

function initZitadel({beforeAuth}: {beforeAuth: AppMiddleware[]}) {
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
                scope: ['openid', 'offline_access', 'urn:zitadel:iam:org:project:id:zitadel:aud'],
                prompt: '1',
            },
            (
                _issuer: string,
                _uiProfile: object,
                _idProfile: object,
                _context: object,
                _idToken: string | object,
                accessToken: string | object,
                refreshToken: string,
                _params: unknown,
                done: VerifyCallback,
            ) => {
                return done(null, {accessToken, refreshToken});
            },
        ),
    );

    passport.serializeUser((user: Express.User | null | undefined, done) => {
        process.nextTick(() => done(null, user));
    });

    passport.deserializeUser(function (user: Express.User | null | undefined, done): void {
        process.nextTick(() => done(null, user));
    });

    beforeAuth.push(
        cookieSession({
            secret: cookieSecret,
            signed: true,
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 * 365, // 1 year
        }),
    );

    beforeAuth.push(passport.initialize());
    beforeAuth.push(passport.session());
}

function initChartsApp({
    beforeAuth,
    afterAuth,
    nodekit,
}: {
    beforeAuth: AppMiddleware[];
    afterAuth: AppMiddleware[];
    nodekit: NodeKit;
}) {
    const chartsEngine = initChartsEngine({
        config: nodekit.config,
        ctx: nodekit.ctx,
        plugins: [
            configuredDashApiPlugin({
                basePath: DASH_API_BASE_URL,
                routeParams: {
                    authPolicy: AuthPolicy.disabled,
                },
                privatePath: PUBLIC_API_DASH_API_BASE_URL,
                privateRouteParams: {
                    authPolicy: AuthPolicy.disabled,
                },
            }),
            ql,
            configurableRequestWithDatasetPlugin(),
        ],
        beforeAuth,
        afterAuth,
    });
    registry.setupChartsEngine(chartsEngine);

    if (isChartsMode) {
        afterAuth.push(xDlContext());
    }

    afterAuth.push(setSubrequestHeaders, patchLogger);

    if (isChartsMode) {
        beforeAuth.push(beforeAuthDefaults);
        afterAuth.push(getCtxMiddleware());
    }

    if (nodekit.config.enablePreloading) {
        chartsEngine.initPreloading(nodekit.ctx);
    }
    return chartsEngine;
}
