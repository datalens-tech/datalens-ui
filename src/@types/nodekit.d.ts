import type {Link, Meta} from '@gravity-ui/app-layout';
import type {Request, Response} from '@gravity-ui/expresskit';

import type {CtxUser} from '../server/components/auth/types/user';
import type {RedisConfig} from '../server/components/cache-client';
import type {ChartTemplates} from '../server/components/charts-engine/components/chart-generator';
import type {SourceConfig} from '../server/components/charts-engine/types';
import type {AppEnvironment, LandingPageSettings} from '../shared';
import type {FeatureConfig} from '../shared/types';

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
    runnerExecutionTimeouts: {
        wizard?: {
            params?: number;
            prepare?: number;
            chartConfig?: number;
            libraryConfig?: number;
            sources?: number;
        };
        [string]: Record<string, number>;
    };
    runResponseWhitelist?: string[];
    allowBodyConfig: boolean;
    chartsEngineConfig: {
        secrets: Record<string, string>;
        enableTelemetry: boolean;
        flags?: Record<string, boolean>;
        usEndpointPostfix: string;
        dataFetcherProxiedHeaders?: string[];
        maxWorkers?: number;
        includeServicePlan?: boolean;
        includeTenantFeatures?: true;
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

    // zitadel
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

    // auth
    isAuthEnabled: boolean;
    authTokenPublicKey?: string;
    authManageLocalUsersDisabled?: boolean;

    chartTemplates: Partial<Record<keyof ChartTemplates, unknown>>;
    redis: RedisConfig | null;
    apiPrefix: string;
    preloadList?: string[];
    releaseVersion?: string;
}

export interface SharedAppDynamicConfig {
    features?: FeatureConfig;
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

    sources: {
        reqBody: Request['body'];
    };

    getAppLayoutSettings: (req: Request, res: Response, name?: string) => AppLayoutSettings;
    landingPageSettings?: LandingPageSettings;

    i18n: ServerI18n;
    tenantId?: string;

    user?: CtxUser;
}

declare module '@gravity-ui/nodekit' {
    export interface AppConfig extends SharedAppConfig {}

    export interface AppDynamicConfig extends SharedAppDynamicConfig {}

    export interface AppContextParams extends SharedAppContextParams {}
}
