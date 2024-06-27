import type {AppMiddleware, AppRoutes} from '@gravity-ui/expresskit';
import {AuthPolicy, ExpressKit} from '@gravity-ui/expresskit';
import type {NodeKit} from '@gravity-ui/nodekit';

import {DASH_API_BASE_URL, PUBLIC_API_DASH_API_BASE_URL} from '../../../shared';
import {isChartsMode, isDatalensMode, isFullMode} from '../../app-env';
import {getAppLayoutSettings} from '../../components/app-layout/app-layout-settings';
import {createLayoutPlugin} from '../../components/app-layout/plugins/layout';
import type {ChartsEngine} from '../../components/charts-engine';
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

const { auth } = require('express-openid-connect');

export default function initApp(nodekit: NodeKit) {
    const beforeAuth: AppMiddleware[] = [];
    const afterAuth: AppMiddleware[] = [];

    registry.setupXlsxConverter(xlsxConverter);

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
        beforeAuth,
        afterAuth,
    });

    const routes: AppRoutes = {};
    Object.keys(extendedRoutes).forEach((key) => {
        const {route, ...params} = extendedRoutes[key];
        routes[route] = params;
    });

    var oidcRoutes = auth({
        issuerBaseURL: 'https://a3f6-94-232-56-134.ngrok-free.app/dev/.well-known/openid-configuration',
        baseURL: 'http://localhost:3030/auth/v1/oidc',
        clientID: 'oidcCLIENT',
        secret: 'secret777',
        clientSecret: 'secret777',
        idpLogout: true,
        authorizationParams: {
            response_type: 'code',
            //response_mode: 'form_post',
            scope: 'openid profile email'
        },
    });
    var expressKit = new ExpressKit(nodekit, routes);
  
    expressKit.express.use('/auth/v1/oidc/', oidcRoutes);
    expressKit.express.get('/auth/v1/oidc/', async (req, res, next) => {
        var r:any = req;
        if(await r.oidc.isAuthenticated()) {
            const userInfo = await r.oidc.fetchUserInfo();
            console.log(userInfo);
        }
        res.redirect('/')
    });
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
        createAppLayoutMiddleware({plugins: [createLayoutPlugin()], getAppLayoutSettings}),
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
