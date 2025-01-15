import type {ControlShared} from '../../control/types';
import {getDistinctsRequestBody} from '../../control/url/distincts/build-distincts-body';
import type {MiddlewareSourceAdapterArgs} from '../../types';
import type {ConfigurableRequestWithDatasetPluginOptions} from '../index';
import {getDatasetFields} from '../request-dataset';

export default async (
    args: MiddlewareSourceAdapterArgs & {
        pluginOptions?: ConfigurableRequestWithDatasetPluginOptions;
    },
) => {
    const {
        ctx,
        source,
        cacheClient,
        userId,
        iamToken,
        workbookId,
        rejectFetchingSource,
        pluginOptions,
        zitadelParams,
        requestHeaders,
    } = args;

    const datasetId = source.datasetId || '';

    const datasetFieldsResponse = await getDatasetFields({
        datasetId,
        workbookId: workbookId ?? null,
        ctx,
        cacheClient,
        userId,
        iamToken,
        rejectFetchingSource,
        pluginOptions,
        zitadelParams,
        requestHeaders,
    });

    const datasetFields = datasetFieldsResponse.datasetFields;

    ctx.log('CONTROLS_DATASET_FIELDS_RECEIVED', {
        count: datasetFields.length,
    });

    const data = getDistinctsRequestBody({
        params: source.sourceArgs.params,
        shared: source.sourceArgs.shared as unknown as ControlShared,
        datasetFields,
        ctx,
    });

    ctx.log('CONTROLS_DATASET_FIELDS_PROCESSED');

    return {
        ...source,
        data,
    };
};
