import {ApiV2Request, IChartEditor} from '../../../../../../shared';
import {MiddlewareUrl} from '../../types';
import {ControlShared} from '../types';

export type SourceControlArgs = {
    shared: ControlShared;
    params: Record<string, string | string[]>;
    ChartEditor: IChartEditor;
};

export type SourceControlRequests = {
    distincts?: SourceControlDistinctsRequestWithDataset | SourceControlDistinctsOldRequest;
    fields: SourceControlFieldsRequest;
};

export type SourceControlDistinctsRequestWithDataset = {
    sourceArgs: SourceControlArgs;
    middlewareUrl: MiddlewareUrl;
    datasetId: string;
} & Omit<ApiV2Request, 'data'>;

export type SourceControlDistinctsOldRequest = ApiV2Request;

export type SourceControlFieldsRequest = {
    url: string;
};
