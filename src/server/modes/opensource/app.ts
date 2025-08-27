import {createUikitPlugin} from '@gravity-ui/app-layout';
import type {AppMiddleware} from '@gravity-ui/expresskit';
import {AuthPolicy} from '@gravity-ui/expresskit';
import type {NodeKit} from '@gravity-ui/nodekit';
import passport from 'passport';

import {DASH_API_BASE_URL, PUBLIC_API_DASH_API_BASE_URL} from '../../../shared';
import {isApiMode, isChartsMode, isDatalensMode, isFullMode} from '../../app-env';
import {getAppLayoutSettings} from '../../components/app-layout/app-layout-settings';
import {createLayoutPlugin} from '../../components/app-layout/plugins/layout';
import type {ChartsEngine} from '../../components/charts-engine';
import {initZitadel} from '../../components/zitadel/init-zitadel';
import {xlsxConverter} from '../../controllers/xlsx-converter';
import {getExpressKit} from '../../expresskit';
import {
    beforeAuthDefaults,
    createAppLayoutMiddleware,
    getCtxMiddleware,
    patchLogger,
    serverFeatureWithBoundedContext,
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

    if (isFullMode || isApiMode) {
        initApiApp({beforeAuth, afterAuth});
    }

    const extendedRoutes = getRoutes({
        ctx: nodekit.ctx,
        chartsEngine,
        passport,
        beforeAuth,
        afterAuth,
    });

    return getExpressKit({extendedRoutes, nodekit});
}

function initDataLensApp({
    beforeAuth,
    afterAuth,
}: {
    beforeAuth: AppMiddleware[];
    afterAuth: AppMiddleware[];
}) {
    beforeAuth.push(
        serverFeatureWithBoundedContext,
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
        beforeAuth.push(serverFeatureWithBoundedContext, beforeAuthDefaults);
        afterAuth.push(getCtxMiddleware());
    }

    if (nodekit.config.enablePreloading) {
        chartsEngine.initPreloading(nodekit.ctx);
    }
    return chartsEngine;
}

function initApiApp({
    beforeAuth,
    afterAuth,
}: {
    beforeAuth: AppMiddleware[];
    afterAuth: AppMiddleware[];
}) {
    // As charts app execpt chartEngine
    if (isApiMode) {
        afterAuth.push(xDlContext(), setSubrequestHeaders, patchLogger, getCtxMiddleware());
        beforeAuth.push(serverFeatureWithBoundedContext, beforeAuthDefaults);
    }
}
