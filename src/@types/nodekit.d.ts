import type {Link, Meta} from '@gravity-ui/app-layout';
import type {Request, Response} from '@gravity-ui/expresskit';

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
    getSourcesByEnv: (appEnv: string) => Record<string, SourceConfig>;
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

    errorBooster?: {
        server?: {
            enabled?: boolean;
            project?: string;
        };
    };

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

    oidc?: boolean;
    oidc_issuer?: string;
    oidc_base_url?: string;
    oidc_client_id?: string;
    oidc_secret?: string;
    oidc_name?: string;

    oidc_2?: boolean;
    oidc_issuer_2?: string;
    oidc_base_url_2?: string;
    oidc_client_id_2?: string;
    oidc_secret_2?: string;
    oidc_name_2?: string;

    oidc_3?: boolean;
    oidc_issuer_3?: string;
    oidc_base_url_3?: string;
    oidc_client_id_3?: string;
    oidc_secret_3?: string;
    oidc_name_3?: string;

    oidc_4?: boolean;
    oidc_issuer_4?: string;
    oidc_base_url_4?: string;
    oidc_client_id_4?: string;
    oidc_secret_4?: string;
    oidc_name_4?: string;
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
