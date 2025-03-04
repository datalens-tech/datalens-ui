import {
    CONTROL_MIDDLEWARE_URL_TYPE,
    REQUEST_WITH_DATASET_SOURCE_NAME,
} from '../../../constants/middleware-urls';
import type {SourceControlArgs, SourceControlDistinctsRequestWithDataset} from '../types';

export const prepareDistinctsRequest = (
    sourceArgs: SourceControlArgs,
): SourceControlDistinctsRequestWithDataset => {
    const datasetId = sourceArgs.shared.source.datasetId;
    return {
        sourceArgs,
        method: 'POST',
        path: 'values/distinct',
        datasetId,
        middlewareUrl: {
            sourceName: REQUEST_WITH_DATASET_SOURCE_NAME,
            middlewareType: CONTROL_MIDDLEWARE_URL_TYPE,
        },
    };
};
