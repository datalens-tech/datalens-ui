import type {AppMiddleware} from '@gravity-ui/expresskit';
import type {AppConfig, AppContext} from '@gravity-ui/nodekit';

import type CacheClient from '../cache-client';

import {CommentsFetcher} from './components/processor/comments-fetcher';
import {Console} from './components/processor/console';
import {DataFetcher} from './components/processor/data-fetcher';
import {Request} from './components/request';
import {initPreloading, initStorage} from './components/storage';
import {chartsController} from './controllers/charts';
import {configController} from './controllers/config';
import {embeddedEntryController} from './controllers/embedded-entry';
import {embedsController} from './controllers/embeds';
import {exportController} from './controllers/export';
import {markdownController} from './controllers/markdown';
import {runController} from './controllers/run';
const defaultControllers = {
    export: exportController,
    markdown: markdownController,
    run: runController,
    config: configController,
    charts: chartsController,
    embeds: embedsController,
    embeddedEntry: embeddedEntryController,
};
import type {Runner} from './runners';
import type {ChartEngineController, Plugin, SourceConfig, TelemetryCallbacks} from './types';
import {MiddlewareStage} from './types';

type Controllers = {
    export: ReturnType<typeof exportController>;
    markdown: typeof markdownController;
    run: ReturnType<typeof runController>;
    config: ReturnType<typeof configController>;
    charts: ReturnType<typeof chartsController>;
    embeds: ReturnType<typeof embedsController>;
    embeddedEntry: typeof embeddedEntryController;
};

class ChartsEngine {
    runners: Runner[];
    sources: Record<string, SourceConfig>;
    telemetryCallbacks: TelemetryCallbacks;
    processorHooks: Record<string, any>[];
    flags: Record<string, boolean>;
    cacheClient: CacheClient;
    controllers: Controllers;
    plugins: Plugin[];
    beforeAuth: AppMiddleware[];
    afterAuth: AppMiddleware[];

    constructor({
        config,
        secrets,
        plugins,
        telemetryCallbacks = {},
        flags = {},
        cacheClient,
        beforeAuth,
        afterAuth,
        runners,
    }: {
        config: AppConfig;
        secrets: Record<string, string>;
        plugins: Plugin[];
        telemetryCallbacks?: TelemetryCallbacks;
        flags?: Record<string, boolean>;
        cacheClient: CacheClient;
        beforeAuth: AppMiddleware[];
        afterAuth: AppMiddleware[];
        runners: Runner[];
    }) {
        this.runners = runners;
        this.sources = config.sources;
        this.telemetryCallbacks = telemetryCallbacks;
        this.processorHooks = [];
        this.flags = flags;
        this.plugins = plugins;
        this.beforeAuth = beforeAuth;
        this.afterAuth = afterAuth;

        initStorage({
            initialOauthToken: secrets.ROBOT_OAUTH_TOKEN,
            config,
            telemetryCallbacks,
            flags,
        });

        this.cacheClient = cacheClient;

        Request.init({cacheClientInstance: this.cacheClient});

        const {includeServicePlan, includeTenantFeatures} = config.chartsEngineConfig;
        this.controllers = {
            export: defaultControllers.export(),
            markdown: defaultControllers.markdown,
            run: defaultControllers.run(this, {includeServicePlan, includeTenantFeatures}),
            config: defaultControllers.config(this),
            charts: defaultControllers.charts(this),
            embeds: defaultControllers.embeds(this),
            embeddedEntry: defaultControllers.embeddedEntry,
        };

        if (plugins) {
            // Init plugins
            plugins.forEach((plugin) => {
                if (plugin.sources) {
                    this.sources = {
                        ...this.sources,
                        ...plugin.sources,
                    };
                }

                // Apply plugin middlewares
                if (plugin.middlewares) {
                    plugin.middlewares.forEach((middleware) => {
                        if (middleware.stage === MiddlewareStage.BeforeAuth) {
                            this.beforeAuth.push(middleware.fn);
                        }
                        if (middleware.stage === MiddlewareStage.AfterAuth) {
                            this.afterAuth.push(middleware.fn);
                        }
                    });
                }

                // Apply plugin runners
                if (plugin.runners) {
                    this.runners = [...this.runners, ...plugin.runners];
                }

                // Apply sandbox hooks
                if (Array.isArray(plugin.processorHooks)) {
                    this.processorHooks = [...this.processorHooks, ...plugin.processorHooks];
                }

                if (plugin.controllers) {
                    const controllers = Object.entries(plugin.controllers).reduce<
                        Record<string, ChartEngineController>
                    >((acc, [key, value]) => {
                        acc[key] = value(this);
                        return acc;
                    }, {});
                    Object.assign(this.controllers, controllers);
                }
            });
        }
    }

    initPreloading(ctx: AppContext) {
        initPreloading(ctx);
    }
}

export {ChartsEngine, DataFetcher, CommentsFetcher, Console};
