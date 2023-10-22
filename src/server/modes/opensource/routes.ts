import {AppMiddleware, AuthPolicy, Request, Response} from '@gravity-ui/expresskit';
import {AppContext} from '@gravity-ui/nodekit';

import {Feature, isEnabledServerFeature} from '../../../shared';
import {isChartsMode, isDatalensMode, isFullMode} from '../../app-env';
import {ChartsEngine} from '../../components/charts-engine';
import {ping} from '../../controllers/ping';
import {ExtendedAppRouteDescription} from '../../types/controllers';
import {getConfiguredRoute} from '../../utils/routes';
import {applyPluginRoutes} from '../charts/init-charts-engine';

export function getRoutes({
    ctx,
    chartsEngine,
    beforeAuth,
    afterAuth,
}: {
    ctx: AppContext;
    chartsEngine?: ChartsEngine;
    beforeAuth: AppMiddleware[];
    afterAuth: AppMiddleware[];
}) {
    let routes: Record<string, ExtendedAppRouteDescription> = {
        ping: {
            beforeAuth: [],
            afterAuth: [],
            route: 'GET /ping',
            handler: ping,
            authPolicy: AuthPolicy.disabled,
        },
    };

    if (isFullMode || isDatalensMode) {
        routes = {...routes, ...getDataLensRoutes({ctx, beforeAuth, afterAuth})};
    }

    if (isFullMode || isChartsMode) {
        routes = {...routes, ...getChartsRoutes({chartsEngine, beforeAuth, afterAuth})};
    }

    return routes;
}

function getDataLensRoutes({
    ctx,
    beforeAuth,
    afterAuth,
}: {
    ctx: AppContext;
    beforeAuth: AppMiddleware[];
    afterAuth: AppMiddleware[];
}) {
    const ui: Omit<ExtendedAppRouteDescription, 'handler' | 'route'> = {
        beforeAuth,
        afterAuth,
        ui: true,
    };

    const server: Omit<ExtendedAppRouteDescription, 'handler' | 'route'> = {
        beforeAuth,
        afterAuth,
    };

    let routes: Record<string, ExtendedAppRouteDescription> = {
        getConnections: getConfiguredRoute('navigation', {...ui, route: 'GET /connections'}),
        getDatasets: getConfiguredRoute('navigation', {...ui, route: 'GET /datasets'}),
        getWidgets: getConfiguredRoute('navigation', {...ui, route: 'GET /widgets'}),
        getDashboards: getConfiguredRoute('navigation', {...ui, route: 'GET /dashboards'}),
        getDatasetsAll: getConfiguredRoute('dl-main', {...ui, route: 'GET /datasets/*'}),
        getConnectionsAll: getConfiguredRoute('dl-main', {...ui, route: 'GET /connections/*'}),
        getDashboardsAll: {
            route: 'GET /dashboards/*',
            beforeAuth,
            afterAuth,
            handler: (req: Request, res: Response) =>
                res.redirect(req.originalUrl.replace('/dashboards', '')),
        },

        getWizardAll: getConfiguredRoute('dl-main', {...ui, route: 'GET /wizard/*'}),
        getPreview: getConfiguredRoute('dl-main', {...ui, route: 'GET /preview*'}),
        getWorkbooks: getConfiguredRoute('dl-main', {...ui, route: 'GET /workbooks*'}),

        postDeleteLock: getConfiguredRoute('api.deleteLock', {
            ...server,
            route: 'POST /api/private/deleteLock',
        }),

        postGateway: getConfiguredRoute('schematic-gateway', {
            ...server,
            route: 'POST /gateway/:scope/:service/:action?',
        }),

        getNavigate: getConfiguredRoute('navigate', {...ui, route: 'GET /navigate/:entryId'}),

        getEntry: getConfiguredRoute('dl-main', {...ui, route: 'GET  /:entryId'}),
        getNewWizard: getConfiguredRoute('dl-main', {...ui, route: 'GET  /:entryId/new/wizard'}),
        getWidget: getConfiguredRoute('dl-main', {...ui, route: 'GET  /:entryId/:widgetId'}),

        getRoot: getConfiguredRoute('dl-main', {...ui, route: 'GET /'}),
    };

    if (isEnabledServerFeature(ctx, Feature.Ql)) {
        routes = {
            getSql: {
                handler: (_req: Request, res: Response) => {
                    res.redirect(`/ql`);
                },
                beforeAuth,
                afterAuth,
                route: 'GET /sql',
            },

            // Path to UI ql Charts
            getQlEntry: getConfiguredRoute('dl-main', {...ui, route: 'GET /ql/:entryId'}),
            getQlNew: getConfiguredRoute('dl-main', {...ui, route: 'GET /ql/new'}),
            getQlNnewMonitoringql: getConfiguredRoute('dl-main', {
                ...ui,
                route: 'GET /ql/new/monitoringql',
            }),
            getQlNewSql: getConfiguredRoute('dl-main', {...ui, route: 'GET /ql/new/sql'}),
            getQlNewPromql: getConfiguredRoute('dl-main', {...ui, route: 'GET /ql/new/promql'}),
            getEntrNewQl: getConfiguredRoute('dl-main', {...ui, route: 'GET  /:entryId/new/ql'}),
            ...routes,
        };
    }

    return routes;
}

function getChartsRoutes({
    chartsEngine,
    beforeAuth,
    afterAuth,
}: {
    chartsEngine?: ChartsEngine;
    beforeAuth: AppMiddleware[];
    afterAuth: AppMiddleware[];
}) {
    if (!chartsEngine) {
        return {};
    }

    const routes: Record<string, ExtendedAppRouteDescription> = {
        // Routes from Charts Engine
        postApiRun: {
            beforeAuth,
            afterAuth,
            route: 'POST /api/run',
            handler: chartsEngine.controllers.run,
        },
        postApiExport: {
            beforeAuth,
            afterAuth,
            route: 'POST /api/export',
            handler: chartsEngine.controllers.export,
        },
        postApiMarkdownRender: {
            beforeAuth,
            afterAuth,
            route: 'POST /api/markdown/render',
            handler: chartsEngine.controllers.markdown.render,
        },
        postApiMarkdownBatchRender: {
            beforeAuth,
            afterAuth,
            route: 'POST /api/markdown/batchRender',
            handler: chartsEngine.controllers.markdown.batchRender,
        },
        getApiPrivateConfig: {
            beforeAuth,
            afterAuth,
            route: 'GET  /api/private/config',
            handler: chartsEngine.controllers.config,
        },

        // Routes for charts
        postApiChartsV1Charts: {
            beforeAuth,
            afterAuth,
            route: 'POST /api/charts/v1/charts',
            handler: chartsEngine.controllers.charts.create,
        },
        getApiChartsV1ChartsEntryByKey: {
            beforeAuth,
            afterAuth,
            route: 'GET /api/charts/v1/charts/entryByKey',
            handler: chartsEngine.controllers.charts.entryByKey,
        },
        getApiChartsV1ChartsEntry: {
            beforeAuth,
            afterAuth,
            route: 'GET /api/charts/v1/charts/:entryId',
            handler: chartsEngine.controllers.charts.get,
        },
        postApiChartsV1ChartsEntry: {
            beforeAuth,
            afterAuth,
            route: 'POST /api/charts/v1/charts/:entryId',
            handler: chartsEngine.controllers.charts.update,
        },
        deleteApiChartsV1ChartsEntry: {
            beforeAuth,
            afterAuth,
            route: 'DELETE /api/charts/v1/charts/:entryId',
            handler: chartsEngine.controllers.charts.delete,
        },
    };

    // Apply routes from plugins
    applyPluginRoutes({chartsEngine, routes, beforeAuth, afterAuth});

    return routes;
}
