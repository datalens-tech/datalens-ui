import type {Optional} from 'utility-types';

import {ApiV2Request, type ConnectionTypedQueryApiRequest} from '../../../../../../shared';
import type {Source} from '../../../../../components/charts-engine/types';
import {MiddlewareUrl} from '../../types';
import {ControlShared} from '../types';

export type SourceControlArgs = {
    shared: ControlShared;
    params: Record<string, string | string[]>;
};

export type SourceControlRequests =
    | {
          distincts?: SourceControlDistinctsRequestWithDataset | SourceControlDistinctsOldRequest;
          fields: SourceControlFieldsRequest;
      }
    | {connectionDistincts: SourceControlTypedQueryRequest};

export type SourceControlDistinctsRequestWithDataset = {
    sourceArgs: SourceControlArgs;
    middlewareUrl: MiddlewareUrl;
    datasetId: string;
} & Omit<ApiV2Request, 'data'>;

export type SourceControlDistinctsOldRequest = ApiV2Request;

export type SourceControlFieldsRequest = {
    url: string;
};

export type SourceControlTypedQueryRequest = Optional<Source<ConnectionTypedQueryApiRequest>, 'ui'>;
