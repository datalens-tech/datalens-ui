import type {AppMiddleware, Request, Response} from '@gravity-ui/expresskit';
import type {AppConfig, AppContext} from '@gravity-ui/nodekit';

import {AppEnvironment} from '../../../shared';
import CacheClient from '../../components/cache-client';
import {ChartsEngine} from '../../components/charts-engine';
import {getDefaultRunners} from '../../components/charts-engine/runners';
import type {Plugin} from '../../components/charts-engine/types';
import {checkValidation} from '../../lib/validation';
import type {ExtendedAppRouteDescription} from '../../types/controllers';

import {getTelemetryCallbacks} from './telemetry';

export function initChartsEngine({
    plugins,
    ctx,
    config,
    beforeAuth,
    afterAuth,
}: {
    plugins: Plugin[];
    ctx: AppContext;
    config: AppConfig;
    beforeAuth: AppMiddleware[];
    afterAuth: AppMiddleware[];
}) {
    const telemetryCallbacks = getTelemetryCallbacks(ctx);
    const {appEnv, endpoints, chartsEngineConfig} = config;
    if (!appEnv) {
        throw new Error('App environment is not defined');
    }

    const typedAppEnv = appEnv as AppEnvironment;

    if (!Object.values(AppEnvironment).includes(typedAppEnv)) {
        throw new Error(`Unknown app environment: ${appEnv}`);
    }

    config.sources = config.getSourcesByEnv(typedAppEnv);
    config.usEndpoint = endpoints.api.us + chartsEngineConfig.usEndpointPostfix;

    const cacheClient = new CacheClient({config});

    return new ChartsEngine({
        config,
        secrets: chartsEngineConfig.secrets,
        flags: chartsEngineConfig.flags,
        plugins,
        telemetryCallbacks: chartsEngineConfig.enableTelemetry ? telemetryCallbacks : undefined,
        cacheClient,
        nativeModules: chartsEngineConfig.nativeModules,
        beforeAuth,
        afterAuth,
        runners: getDefaultRunners(),
    });
}

export function applyPluginRoutes({
    chartsEngine,
    routes,
    beforeAuth,
    afterAuth,
}: {
    chartsEngine: ChartsEngine;
    routes: Record<string, ExtendedAppRouteDescription>;
    beforeAuth: AppMiddleware[];
    afterAuth: AppMiddleware[];
}) {
    chartsEngine.plugins.forEach((plugin) => {
        const pluginRoutes = plugin.routes || [];

        pluginRoutes.forEach((pluginRoute) => {
            const routeValidationConfig = pluginRoute.validationConfig;
            let handler = pluginRoute.handler;
            if (routeValidationConfig) {
                handler = (req: Request, res: Response) => {
                    const validationResult = checkValidation(req, routeValidationConfig);
                    if (!validationResult.success) {
                        res.status(400).send({
                            message: validationResult.message,
                            details: validationResult.details,
                        });
                        return;
                    }
                    return pluginRoute.handler(req, res);
                };
            }

            const appRoute: Omit<ExtendedAppRouteDescription, 'route'> = {
                handler,
                beforeAuth,
                afterAuth,
            };

            if (pluginRoute.authPolicy) {
                appRoute.authPolicy = pluginRoute.authPolicy;
            }

            if (typeof pluginRoute.disableCsrf !== 'undefined') {
                appRoute.disableCsrf = pluginRoute.disableCsrf;
            }

            routes[`${pluginRoute.method} ${pluginRoute.path}`] = {
                ...appRoute,
                route: `${pluginRoute.method} ${pluginRoute.path}`,
            };
        });
    });
}
