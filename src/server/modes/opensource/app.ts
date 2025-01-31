import {createUikitPlugin} from '@gravity-ui/app-layout';
import type {AppMiddleware, AppRoutes} from '@gravity-ui/expresskit';
import {AuthPolicy, ExpressKit} from '@gravity-ui/expresskit';
import type {NodeKit} from '@gravity-ui/nodekit';
import passport from 'passport';

import {DASH_API_BASE_URL, PUBLIC_API_DASH_API_BASE_URL} from '../../../shared';
import {isChartsMode, isDatalensMode, isFullMode} from '../../app-env';
import {getAppLayoutSettings} from '../../components/app-layout/app-layout-settings';
import {createLayoutPlugin} from '../../components/app-layout/plugins/layout';
import type {ChartsEngine} from '../../components/charts-engine';
import {initZitadel} from '../../components/zitadel/init-zitadel';
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
import { US } from '../../components/sdk';

const { auth } = require('express-openid-connect');

export default function initApp(nodekit: NodeKit) {
    const beforeAuth: AppMiddleware[] = [];
    const afterAuth: AppMiddleware[] = [];

    registry.setupXlsxConverter(xlsxConverter);

    if (nodekit.config.isZitadelEnabled) {
        initZitadel({nodekit, beforeAuth});
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

    var expressKit = new ExpressKit(nodekit, routes);
  
    var oidc_suffix = ['', '_2', '_3', '_4']

    for(var i = 0; i < oidc_suffix.length; i++) {
        var config:any = nodekit.config;
        if(config['oidc' + oidc_suffix[i]]) {
            var oidcRoutes = auth({
                issuerBaseURL: config['oidc_issuer' + oidc_suffix[i]],
                baseURL: config['oidc_base_url' + oidc_suffix[i]],
                clientID: config['oidc_client_id' + oidc_suffix[i]],
                secret: config['oidc_secret' + oidc_suffix[i]],
                clientSecret: config['oidc_secret' + oidc_suffix[i]],
                idpLogout: true,
                authorizationParams: {
                    response_type: 'code',
                    scope: 'openid email profile'
                },
            });

            expressKit.express.get(`/auth/v${i+1}/oidc/callback`, async (req, res, next) => {
                if(req.query['error'] == 'access_denied') {
                    res.redirect(`/?x-rpc-authorization=`)
                }
                next();
            });
            expressKit.express.use(`/auth/v${i+1}/oidc`, oidcRoutes);
            expressKit.express.get(`/auth/v${i+1}/oidc`, async (req, res, next) => {
                var r:any = req;

                if(await r.oidc.isAuthenticated()) {
                    const token: string = r.oidc.accessToken.access_token;
                    const user = await r.oidc.user;
                    var result = await US.oidcAuth({"login": user.sub, "token": token, "data": Buffer.from(JSON.stringify(user)).toString('base64') }, req.ctx)
                    if(result && result.data) {
                        return res.redirect(`/?x-rpc-authorization=${result.data.token}`)
                    }
                }
                next();
            });
        }
    }

    return expressKit;
}

function initDataLensApp({
    beforeAuth,
    afterAuth,
}: {
    beforeAuth: AppMiddleware[];
    afterAuth: AppMiddleware[];
}) {
    beforeAuth.push(
        createAppLayoutMiddleware({
            plugins: [createLayoutPlugin(), createUikitPlugin()],
            getAppLayoutSettings,
        }),
        beforeAuthDefaults,
    );

    afterAuth.push(xDlContext(), getCtxMiddleware());
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
                    authPolicy:
                        nodekit.config.isZitadelEnabled || nodekit.config.isAuthEnabled
                            ? AuthPolicy.required
                            : AuthPolicy.disabled,
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