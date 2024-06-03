import {DATASET_FIELDS_URL, DATASET_ID_PLACEHOLDER} from '../constants';
import type {SourceControlFieldsRequest} from '../types';

export const prepareFieldsRequest = ({
    datasetId,
}: {
    datasetId: string;
}): SourceControlFieldsRequest => {
    return {
        url: DATASET_FIELDS_URL.replace(DATASET_ID_PLACEHOLDER, datasetId),
    };
};
