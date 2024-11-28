import type {AppMiddleware, Request, Response} from '@gravity-ui/expresskit';
import type {AppConfig, AppContext} from '@gravity-ui/nodekit';
import get from 'lodash/get';
import sizeof from 'object-sizeof';

import {
    AppEnvironment,
    Feature,
    isEnabledServerFeature,
    isObjectWithFunction,
} from '../../../shared';
import CacheClient from '../../components/cache-client';
import {ChartsEngine} from '../../components/charts-engine';
import {getDefaultRunners} from '../../components/charts-engine/runners';
import type {Plugin, TelemetryCallbacks} from '../../components/charts-engine/types';
import {checkValidation} from '../../lib/validation';
import type {ExtendedAppRouteDescription} from '../../types/controllers';

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
    const getTime = () => new Date().toISOString().replace('T', ' ').split('.')[0];
    const shouldLogChartWithFunction = isEnabledServerFeature(ctx, Feature.ChartWithFnLogging);

    const telemetryCallbacks: TelemetryCallbacks = {
        onConfigFetched: ({id, statusCode, requestId, latency = 0, traceId, tenantId, userId}) => {
            ctx.stats('apiRequests', {
                requestId: requestId!,
                service: 'us',
                action: 'fetchConfig',
                responseStatus: statusCode || 200,
                requestTime: latency,
                requestMethod: 'POST',
                requestUrl: id || '',
                traceId: traceId || '',
                tenantId: tenantId || '',
                userId: userId || '',
            });
        },
        onConfigFetchingFailed: (
            _error,
            {id, statusCode, requestId, latency = 0, traceId, tenantId, userId},
        ) => {
            ctx.stats('apiRequests', {
                requestId: requestId!,
                service: 'us',
                action: 'fetchConfig',
                responseStatus: statusCode || 500,
                requestTime: latency,
                requestMethod: 'POST',
                requestUrl: id || '',
                traceId: traceId || '',
                tenantId: tenantId || '',
                userId: userId || '',
            });
        },

        onDataFetched: ({
            sourceName,
            url,
            requestId,
            statusCode,
            latency,
            traceId,
            tenantId,
            userId,
        }) => {
            ctx.stats('apiRequests', {
                requestId,
                service: sourceName || 'unknown-charts-source',
                action: 'fetchData',
                responseStatus: statusCode || 200,
                requestTime: latency,
                requestMethod: 'POST',
                requestUrl: url || '',
                traceId: traceId || '',
                tenantId: tenantId || '',
                userId: userId || '',
            });
        },
        onDataFetchingFailed: (
            _error,
            {sourceName, url, requestId, statusCode, latency, traceId, tenantId, userId},
        ) => {
            ctx.stats('apiRequests', {
                requestId,
                service: sourceName || 'unknown-charts-source',
                action: 'fetchData',
                responseStatus: statusCode || 500,
                requestTime: latency,
                requestMethod: 'POST',
                requestUrl: url || '',
                traceId: traceId || '',
                tenantId: tenantId || '',
                userId: userId || '',
            });
        },

        onCodeExecuted: ({id, requestId, latency}) => {
            ctx.stats('executions', {
                datetime: getTime(),
                requestId,
                entryId: id,
                jsTabExecDuration: Math.ceil(latency),
            });
        },

        onTabsExecuted: ({result, entryId}) => {
            const {
                config: chartConfig,
                highchartsConfig,
                sources,
                sourceData,
                processedData,
            } = result;
            const chartEntryId = entryId || '';
            const datetime = Date.now();

            if (
                shouldLogChartWithFunction &&
                (isObjectWithFunction(chartConfig) || isObjectWithFunction(highchartsConfig))
            ) {
                ctx.stats('chartsWithFn', {datetime, entryId: chartEntryId});
            }

            let rowsCount = 0;
            let columnsCount = 0;
            if (sourceData && typeof sourceData === 'object') {
                Object.values(sourceData as object).forEach((item) => {
                    rowsCount += get(item, 'result_data[0].rows.length', 0);
                    columnsCount = Math.max(
                        columnsCount,
                        get(item, 'result_data[0].rows[0].data.length', 0),
                    );
                }, 0);
            }

            ctx.stats('chartSizeStats', {
                datetime,
                entryId: chartEntryId,
                requestedDataSize:
                    sources && typeof sources === 'object'
                        ? Object.values(sources as object).reduce<number>(
                              (sum, item) => sum + get(item, 'size', 0),
                              0,
                          )
                        : 0,
                requestedDataRowsCount: rowsCount,
                requestedDataColumnsCount: columnsCount,
                processedDataSize: sizeof(processedData),
            });
        },
    };

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
