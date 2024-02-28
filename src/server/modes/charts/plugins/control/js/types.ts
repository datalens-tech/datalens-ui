import type {ApiV2ResultData} from '../../../../../../shared';
import type {PartialDatasetField} from '../../../../../../shared/schema';

export type ControlDatasetFields = {
    fields: PartialDatasetField[];
};
export type SourceResponseData = {
    distincts?: ApiV2ResultData;
    fields?: ControlDatasetFields;
};
