import type {OutgoingHttpHeaders} from 'http';

import type {Request} from '@gravity-ui/expresskit';
import type {AppContext} from '@gravity-ui/nodekit';

import type {WorkbookId} from '../../../../shared';
import type {CacheClient} from '../../../components/cache-client';
import type {
    AuthParams,
    ZitadelParams,
} from '../../../components/charts-engine/components/processor/data-fetcher';

import type {
    CHARTS_MIDDLEWARE_URL_TYPE,
    CONTROL_MIDDLEWARE_URL_TYPE,
    REQUEST_WITH_DATASET_SOURCE_NAME,
} from './constants/middleware-urls';
import type {SourcesArgs} from './datalens/url/build-sources/types';

export interface SourceAdapterRequestSettings {
    useCaching: boolean;
    requestOptions: {
        body: Record<string, any>;
        headers: Record<string, any>;
        json: boolean;
        spStatFormat: any;
        timeout: number;
        uri: string;
        method: string;
    };
    requestControl: {
        allBuffersLength: number;
    };
    processingRequests: any[];
}

export interface SourceAdapterArgs {
    targetUri: string;
    sourceName: string;
    req: Request;
    source: Record<string, any>;
    fetchingStartTime: number;
}

export interface MiddlewareUrl {
    sourceName: typeof REQUEST_WITH_DATASET_SOURCE_NAME;
    middlewareType: MiddlewareUrlType;
}

export interface MiddlewareSourceAdapterArgs {
    ctx: AppContext;
    sourceName: string;
    source: {
        sourceArgs: SourcesArgs;
        middlewareUrl: MiddlewareUrl;
        datasetId?: string;
    };
    iamToken?: string;
    workbookId?: WorkbookId;
    cacheClient: CacheClient;
    userId: string | null;
    rejectFetchingSource: (reason: any) => void;
    zitadelParams: ZitadelParams | undefined;
    authParams: AuthParams | undefined;
    requestHeaders: OutgoingHttpHeaders;
}

export interface ProcessorHookInitArgs {
    req: Request;
    config: any;
    isEditMode: boolean;
}

export interface PluginProcessorHook {
    name: string;
    init: (args: ProcessorHookInitArgs) => any;
}

export type MiddlewareUrlType =
    | typeof CHARTS_MIDDLEWARE_URL_TYPE
    | typeof CONTROL_MIDDLEWARE_URL_TYPE;
