import {Request} from '@gravity-ui/expresskit';

import type {WorkbookId} from '../../../../shared';
import type {ChartsEngine} from '../../../components/charts-engine';

import {
    CHARTS_MIDDLEWARE_URL_TYPE,
    CONTROL_MIDDLEWARE_URL_TYPE,
    REQUEST_WITH_DATASET_SOURCE_NAME,
} from './constants/middleware-urls';
import {SourcesArgs} from './datalens/url/build-sources/types';

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
    sourceName: string;
    source: {
        sourceArgs: SourcesArgs;
        middlewareUrl: MiddlewareUrl;
        datasetId?: string;
    };
    req: Request;
    iamToken?: string;
    workbookId?: WorkbookId;
    ChartsEngine: ChartsEngine;
    userId: string | null;
    rejectFetchingSource: (reason: any) => void;
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
