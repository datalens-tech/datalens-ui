import type {Link, Meta} from '@gravity-ui/app-layout';
import type {Request, Response} from '@gravity-ui/expresskit';

import type {RedisConfig} from '../server/components/cache-client';
import type {ChartTemplates} from '../server/components/charts-engine/components/chart-generator';
import type {AppEnvironment} from '../shared';
import type {FeaturesConfig} from '../src/components/features/types';

export interface SharedAppConfig {
    endpoints: Endpoints;
    features: FeatureConfig;
    metrika: MetrikaCounter;

    usMasterToken?: string;

    regionalEnvConfig?: {allowLanguages?: string[]; defaultLang?: string; langRegion?: string};

    faviconUrl: string;

    links?: Link[];
    meta?: Meta[];

    chartkitSettings?: ChartkitGlobalSettings;
    serviceName: string;
    // CHARTS ENGINE -- START
    usEndpoint: string;
    getSourcesByEnv: (appEnv: AppEnvironment) => Record<string, SourceConfig>;
    sources: Record<string, SourceConfig>;
    appMode?: string;

    enablePreloading?: boolean;
    fetchingTimeout: number;
    singleFetchingTimeout: number;
    runResponseWhitelist?: string[];
    allowBodyConfig: boolean;
    chartsEngineConfig: {
        nativeModules: Record<string, unknown>;
        secrets: Record<string, string>;
        enableTelemetry: boolean;
        flags?: Record<string, boolean>;
        usEndpointPostfix: string;
        dataFetcherProxiedHeaders?: string[];
    };
    // CHARTS ENGINE -- FINISH

    useIPV6?: boolean;
    workers?: number;

    requestIdHeaderName: string;
    gatewayProxyHeaders: string[];
    headersMap: Record<string, string>;

    iamResources?: {
        collection: {
            roles: {
                admin: string;
                editor: string;
                viewer: string;
                limitedViewer?: string;
            };
        };
        workbook: {
            roles: {
                admin: string;
                editor: string;
                viewer: string;
                limitedViewer?: string;
            };
        };
    };

    isZitadelEnabled: boolean;

    clientId?: string;
    clientSecret?: string;

    zitadelProjectId?: string;

    zitadelUri?: string;
    zitadelInternalUri?: string;
    appHostUri?: string;
    zitadelCookieSecret?: string;

    serviceClientId?: string;
    serviceClientSecret?: string;

    chartTemplates: Partial<Record<keyof ChartTemplates, unknown>>;
    redis: RedisConfig | null;
    apiPrefix: string;
    preloadList?: string[];
}

export interface SharedAppDynamicConfig {
    features?: FeaturesConfig;
}

export interface SharedAppContextParams {
    userId: string;
    gateway: {
        reqBody: Request['body'];
        requestId: string;

        checkRequestForDeveloperModeAccess: (args: {
            ctx: AppContext;
        }) => Promise<DeveloperModeCheckStatus>;
        markdown: MarkdownContextAction;

        resolveEntryByLink: (
            args: ResolveEntryByLinkComponentArgs,
        ) => Promise<ResolveEntryByLinkComponentResponse>;
    };

    getAppLayoutSettings: (req: Request, res: Response, name?: string) => AppLayoutSettings;
    landingPageSettings?: LandingPageSettings;

    i18n: ServerI18n;
    tenantId?: string;
}

declare module '@gravity-ui/nodekit' {
    export interface AppConfig extends SharedAppConfig {}

    export interface AppDynamicConfig extends SharedAppDynamicConfig {}

    export interface AppContextParams extends SharedAppContextParams {}
}
