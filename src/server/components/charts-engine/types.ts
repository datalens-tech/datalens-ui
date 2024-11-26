import type {OutgoingHttpHeaders} from 'http';

import type {AppMiddleware, AppRouteDescription, Request, Response} from '@gravity-ui/expresskit';
import type {HttpMethod} from '@gravity-ui/expresskit/dist/types';

import type {EDITOR_TYPE_CONFIG_TABS} from '../../../shared';
import type {SourcesArgs} from '../../modes/charts/plugins/datalens/url/build-sources/types';
import type {MiddlewareSourceAdapterArgs, MiddlewareUrl} from '../../modes/charts/plugins/types';

import type {Runner} from './runners';

export type TelemetryCallbacks = {
    onConfigFetched?: ({
        id,
        statusCode,
        requestId,
        traceId,
        latency,
        tenantId,
    }: {
        id: string;
        statusCode: number;
        requestId?: string;
        traceId?: string;
        latency?: number;
        tenantId?: string;
        userId?: string;
    }) => void;
    onConfigFetchingFailed?: (
        error: Error,
        {
            id,
            statusCode,
            requestId,
            traceId,
            tenantId,
            latency,
        }: {
            id: string;
            statusCode: number;
            requestId?: string;
            traceId?: string;
            userId?: string;
            tenantId?: string;
            latency?: number;
        },
    ) => void;
    onDataFetched?: ({
        sourceName,
        url,
        requestId,
        traceId,
        tenantId,
        statusCode,
        latency,
        userId,
    }: {
        sourceName: string;
        url: string;
        requestId: string;
        traceId?: string;
        tenantId?: string;
        userId?: string;
        statusCode: number;
        latency: number;
    }) => void;
    onDataFetchingFailed?: (
        error: Error,
        {
            sourceName,
            url,
            requestId,
            traceId,
            tenantId,
            userId,
            statusCode,
            latency,
        }: {
            sourceName: string;
            url: string;
            requestId: string;
            traceId?: string;
            tenantId?: string;
            userId?: string;
            statusCode: number;
            latency: number;
        },
    ) => void;
    onCodeExecuted?: ({
        id,
        requestId,
        latency,
    }: {
        id: string;
        requestId: string;
        latency: number;
    }) => void;
    onTabsExecuted?: ({
        result,
        entryId,
    }: {
        result: {
            config: unknown;
            highchartsConfig: unknown;
            sources: unknown;
            processedData: unknown;
            sourceData: unknown;
        };
        entryId: string;
    }) => void;
};

export type Source<T = string | Record<string, string>> = {
    url: string;
    method?: string;
    headers?: OutgoingHttpHeaders;
    cache?: string;
    statFormat?: string;
    format?: 'json' | 'form' | 'text' | string;
    middlewareUrl?: MiddlewareUrl;
    data?: T;
    hideInInspector?: boolean;
    ui?: boolean;
    sourceArgs?: SourcesArgs;
};

export type SourceConfig = {
    description?: {
        title: {
            ru: string;
            en: string;
        };
    };
    tvmServiceName?: string;
    postprocess?: (data: unknown, requestOptions: unknown) => unknown;
    aliases?: Set<string>;
    useCaching?: boolean;
    uiEndpointFormatter?: (url: string, sourceData?: Source['data']) => string | null;
    uiEndpoint?: string;
    passedCredentials?: Record<string, boolean>;
    extraHeaders?: Record<string, string> | ((req: Request) => Record<string, string>);
    sourceType?: string;
    dataEndpoint?: string;
    preprocess?: (url: string) => string;
    allowedMethods?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

    adapter?: ({
        targetUri,
        sourceName,
        req,
    }: {
        targetUri: string;
        sourceName: string;
        source: Source;
        req: Request;
        fetchingStartTime: number;
    }) => Promise<unknown>;

    middlewareAdapter?: (args: MiddlewareSourceAdapterArgs) => Promise<any>;
    check?: (
        req: Request,
        targetUri: string,
        params: Request['body']['params'],
    ) => Promise<boolean>;

    args?: Record<string, string | number | (string | number)[]>;
    maxRedirects?: number;
};

export enum MiddlewareStage {
    BeforeAuth = 'beforeAuth',
    AfterAuth = 'afterAuth',
}

export type Middleware = {stage: MiddlewareStage; fn: AppMiddleware};
export interface PluginRoute {
    method: Uppercase<HttpMethod>;
    path: string;
    handler: AppRouteDescription['handler'];
    authPolicy?: AppRouteDescription['authPolicy'];
    disableCsrf?: boolean;
    validationConfig?: {
        [key: string]: any;
        query?: Object;
        params?: Object;
        body?: Object;
    };
}

export type ChartEngineController = (req: Request, res: Response) => Promise<void> | unknown;

export interface Plugin {
    middlewares?: Middleware[];
    sources?: Record<string, SourceConfig>;
    runners?: Runner[];
    processorHooks?: Record<string, any>[];
    routes?: PluginRoute[];
    controllers?: Record<string, (chartsEngine: any) => ChartEngineController>;
}

export type ChartStorageType = keyof typeof EDITOR_TYPE_CONFIG_TABS;
