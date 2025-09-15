import type {
    ApiV2Request,
    Link,
    ServerChartsConfig,
    ServerPlaceholder,
    ServerVisualization,
    Shared,
    StringParams,
} from '../../../../../../shared';
import type {MiddlewareUrl} from '../../types';
import type {ApiVersion} from '../types';

export type SourcesArgs = {
    params: StringParams;
    shared: Shared;
    apiVersion?: ApiVersion;
};

export type PrepareSourceRequestsArgs = {
    apiVersion: ApiVersion;
    datasetsIds: string[];
    visualization: ServerVisualization;
    extraSettings: ServerChartsConfig['extraSettings'];
    sourceArgs: SourcesArgs;
    links?: Link[];
};

export type PrepareSingleSourceRequestArgs = {
    apiVersion: ApiVersion;
    datasetsIds: string[];
    layerId?: string;
    placeholders: ServerPlaceholder[];
    sourceArgs: SourcesArgs;
    isPivotRequest: boolean;
    links?: Link[];
};

export type SourceRequests = Record<string, SourceRequest>;

export type SourceRequest = Omit<ApiV2Request, 'data'> & {
    sourceArgs?: SourcesArgs;
    middlewareUrl?: MiddlewareUrl;
    hideInInspector?: boolean;
};

export type PrepareSourceRequestBody = {
    datasetId: string;
    apiVersion: ApiVersion;
    sourceArgs: SourcesArgs;
    isPivotRequest: boolean;
};
