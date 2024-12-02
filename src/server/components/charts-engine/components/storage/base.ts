import type {Request} from '@gravity-ui/expresskit';
import type {AppConfig, AppContext} from '@gravity-ui/nodekit';
import {v4 as uuidv4} from 'uuid';

import type {WorkbookId} from '../../../../../shared';
import type {TelemetryCallbacks} from '../../types';

import type {EmbeddingInfo, ResolvedConfig} from './types';
import type {USProvider} from './united-storage/provider';

const DEFAULT_PRELOAD_FETCHING_INTERVAL = 120e3;

export type ResolveConfigProps = {
    id?: string;
    key: string;
    headers: Request['headers'];
    unreleased?: boolean;
    noCache?: boolean;
    requestId?: string;
    storageApiPath?: string;
    extraAllowedHeaders?: string[];
    workbookId?: WorkbookId;
};

export type EmbedResolveConfigProps = ResolveConfigProps & {embedToken: string; embedId: string};

export type ResolveConfigError = {
    response?: {status: number};
    status?: number;
    statusCode?: number;
} & Error;

export type BaseStorageInitParams = {
    initialPreloadFetchingInterval?: number;
    initialOauthToken: string;
    config: {usEndpoint: string; requestIdHeaderName: string};
    telemetryCallbacks: {
        onConfigFetched?: TelemetryCallbacks['onConfigFetched'];
        onConfigFetchingFailed?: TelemetryCallbacks['onConfigFetchingFailed'];
    };
    flags: {alwaysUnreleased?: boolean};
};

export class BaseStorage {
    provider: typeof USProvider;
    requestIdHeaderName = '';
    preloadFetchingInterval?: number;
    oauthToken?: string;
    cachedConfigs: Record<string, ResolvedConfig> = {};
    flags: {alwaysUnreleased?: boolean | undefined} = {};
    telemetryCallbacks: {
        onConfigFetched?: TelemetryCallbacks['onConfigFetched'];
        onConfigFetchingFailed?: TelemetryCallbacks['onConfigFetchingFailed'];
    } = {};

    constructor(provider: typeof USProvider) {
        this.provider = provider;
    }

    init({
        initialPreloadFetchingInterval = DEFAULT_PRELOAD_FETCHING_INTERVAL,
        initialOauthToken,
        config,
        telemetryCallbacks,
        flags,
    }: BaseStorageInitParams) {
        this.preloadFetchingInterval = initialPreloadFetchingInterval;
        this.oauthToken = initialOauthToken;
        this.cachedConfigs = {};
        this.requestIdHeaderName = config.requestIdHeaderName;

        this.flags = flags;
        this.telemetryCallbacks = telemetryCallbacks;

        this.initProvider(config);
    }

    async refreshPreloaded(
        parentCtx: AppContext & {config: AppConfig},
        callback: (configs: Record<string, ResolvedConfig>) => void,
    ) {
        const requestId = uuidv4();
        const ctx = parentCtx.create('Configs preloading', {loggerPostfix: requestId});
        ctx.set('requestId', requestId);
        ctx.setTag('request_id', requestId);

        ctx.log('STORAGE_REFRESHING_PRELOADED');
        const preloadList = parentCtx.config.preloadList || [];
        try {
            for (const key of preloadList) {
                await this.resolveConfig(ctx, {
                    key,
                    headers: {
                        authorization: `OAuth ${this.oauthToken}`,
                    },
                    noCache: true,
                    requestId,
                })
                    .then((config) => {
                        this.cachedConfigs[key] = config;
                    })
                    .catch((error) => {
                        ctx.logError('Error preloading config', error, {
                            key,
                        });
                    });
            }

            setTimeout(
                () => this.refreshPreloaded(parentCtx, callback),
                this.preloadFetchingInterval,
            );
            callback(this.cachedConfigs);
        } catch (error) {
            ctx.logError('Error preloading configs', error);
        } finally {
            ctx.end();
        }
    }

    initPreloading(ctx: AppContext, callback: (configs: Record<string, ResolvedConfig>) => void) {
        this.refreshPreloaded(ctx, callback).catch((error) => {
            ctx.logError('Error preloading configs', error);
        });
    }

    fetchConfig(
        ctx: AppContext,
        params: EmbedResolveConfigProps & {unreleased: boolean},
    ): Promise<EmbeddingInfo>;
    fetchConfig(
        ctx: AppContext,
        params: ResolveConfigProps & {unreleased: boolean},
    ): Promise<ResolvedConfig>;
    fetchConfig(
        ctx: AppContext,
        params: (ResolveConfigProps | EmbedResolveConfigProps) & {unreleased: boolean},
    ): Promise<ResolvedConfig | EmbeddingInfo> {
        const {headers, unreleased, requestId, storageApiPath, extraAllowedHeaders, workbookId} =
            params;
        if (requestId) {
            headers[this.requestIdHeaderName] = requestId;
        }

        const storageRetrieveArgs = {
            headers,
            unreleased: this.flags.alwaysUnreleased ? true : unreleased,
            includePermissionsInfo: true,
            storageApiPath,
            extraAllowedHeaders,
        };

        const onConfigFetched = this.telemetryCallbacks.onConfigFetched || (() => {});
        const onConfigFetchingFailed = this.telemetryCallbacks.onConfigFetchingFailed || (() => {});

        const startTime = new Date().getTime();

        let retrieve: Promise<ResolvedConfig | EmbeddingInfo>;
        let id: string;

        if (params.id && 'embedToken' in params && params.embedToken) {
            retrieve = this.provider.retrieveByTokenAndId(ctx, {
                token: params.embedToken,
                id: params.id,
                ...storageRetrieveArgs,
            });
            id = `embed-${params.embedId}`;
        } else if (params.id) {
            retrieve = this.provider.retrieveById(ctx, {
                id: params.id,
                workbookId,
                ...storageRetrieveArgs,
            });
            id = params.id;
        } else if ('embedToken' in params && params.embedToken) {
            retrieve = this.provider.retrieveByToken(ctx, {
                token: params.embedToken,
                ...storageRetrieveArgs,
            });
            id = `embed-${params.embedId}`;
        } else if (params.key) {
            retrieve = this.provider.retrieveByKey(ctx, {key: params.key, ...storageRetrieveArgs});
            id = params.key;
        } else {
            throw new Error('Wrong fetch config params');
        }

        const traceId = ctx.getTraceId();
        const tenantId = ctx.get('tenantId');
        const userId = ctx.get('userId');

        return retrieve
            .then((result) => {
                onConfigFetched({
                    id,
                    requestId,
                    traceId,
                    statusCode: 200,
                    latency: new Date().getTime() - startTime,
                    tenantId,
                    userId,
                });
                return result;
            })
            .catch((error: ResolveConfigError) => {
                onConfigFetchingFailed(error, {
                    id,
                    requestId,
                    traceId,
                    tenantId,
                    statusCode: error.status || error.statusCode || error.response?.status || 500,
                    latency: new Date().getTime() - startTime,
                    userId,
                });
                throw error;
            });
    }

    setPreloaded(preloaded: Record<string, ResolvedConfig>) {
        this.cachedConfigs = preloaded;
    }

    resolveConfig(ctx: AppContext, props: ResolveConfigProps): Promise<ResolvedConfig> {
        const {key, unreleased = false, noCache = false} = props;
        if (!noCache && !unreleased && this.cachedConfigs[key]) {
            ctx.log('STORAGE_CONF_PRELOAD_HIT', {key});
            return Promise.resolve(this.cachedConfigs[key]);
        }

        return this.fetchConfig(ctx, {...props, unreleased});
    }

    resolveEmbedConfig(ctx: AppContext, props: EmbedResolveConfigProps): Promise<EmbeddingInfo> {
        const {unreleased = false} = props;
        return this.fetchConfig(ctx, {...props, unreleased});
    }

    private initProvider(config: BaseStorageInitParams['config']) {
        this.provider.init({
            endpoint: config.usEndpoint,
            requestIdHeaderName: this.requestIdHeaderName,
        });
    }
}
