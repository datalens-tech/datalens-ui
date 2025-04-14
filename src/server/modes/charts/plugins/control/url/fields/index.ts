import type {SourceControlFieldsRequest} from '../types';

export const prepareFieldsRequest = ({
    datasetId,
}: {
    datasetId: string;
}): SourceControlFieldsRequest => {
    return {
        datasetId: datasetId,
        path: 'fields',
    };
};
