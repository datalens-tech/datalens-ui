import {
    ApiV2Request,
    IChartEditor,
    Link,
    ServerChartsConfig,
    ServerPlaceholder,
    ServerVisualization,
    Shared,
    StringParams,
} from '../../../../../../../shared';
import {MiddlewareUrl} from '../../../types';
import {ApiVersion} from '../../types';

export type BuildSourcesArgs = {
    params: StringParams;
    shared: Shared;
    ChartEditor: IChartEditor;
    apiVersion?: ApiVersion;
};

export type PrepareSourceRequestsArgs = {
    apiVersion: ApiVersion;
    datasetsIds: string[];
    visualization: ServerVisualization;
    extraSettings: ServerChartsConfig['extraSettings'];
    sourceArgs: BuildSourcesArgs;
    links?: Link[];
};

export type PrepareSingleSourceRequestArgs = {
    apiVersion: ApiVersion;
    datasetsIds: string[];
    layerId?: string;
    placeholders: ServerPlaceholder[];
    sourceArgs: BuildSourcesArgs;
    isPivotRequest: boolean;
    links?: Link[];
};

export type SourceRequests = Record<string, SourceRequest>;

export type SourceRequest = Omit<ApiV2Request, 'data'> & {
    sourceArgs?: BuildSourcesArgs;
    middlewareUrl?: MiddlewareUrl;
    hideInInspector?: boolean;
};

export type PrepareSourceRequestBody = {
    datasetId: string;
    apiVersion: ApiVersion;
    sourceArgs: BuildSourcesArgs;
    isPivotRequest: boolean;
};
