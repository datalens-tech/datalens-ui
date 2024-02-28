import type {ApiV2ResultData, ConnectionTypedQueryApiResponse} from '../../../../../../shared';
import type {PartialDatasetField} from '../../../../../../shared/schema';

export type ControlDatasetFields = {
    fields: PartialDatasetField[];
};
export type SourceResponseData = {
    distincts?: ApiV2ResultData;
    fields?: ControlDatasetFields;
    connectionDistincts?: ConnectionTypedQueryApiResponse;
};
