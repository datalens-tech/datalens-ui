import Cache from '../../../../../components/cache-client';
import {getDistinctsRequestBody} from '../../control/url/distincts/build-distincts-body';
import {MiddlewareSourceAdapterArgs} from '../../types';
import type {ConfigurableRequestWithDatasetPluginOptions} from '../index';
import {getDatasetFields} from '../request-dataset';

export default async (
    args: MiddlewareSourceAdapterArgs & {
        pluginOptions?: ConfigurableRequestWithDatasetPluginOptions;
    },
) => {
    const {source, req, ChartsEngine, userId, iamToken, rejectFetchingSource, pluginOptions} = args;

    const cacheClient = ChartsEngine.cacheClient as Cache;

    const datasetId = source.datasetId || '';

    const datasetFieldsResponse = await getDatasetFields({
        datasetId,
        workbookId: null, // TODO: add workbookId
        req,
        cacheClient,
        userId,
        iamToken,
        rejectFetchingSource,
        pluginOptions,
    });

    const datasetFields = datasetFieldsResponse.datasetFields;

    req.ctx.log('CONTROLS_DATASET_FIELDS_RECEIVED', {
        count: datasetFields.length,
    });

    const data = getDistinctsRequestBody({
        ...source.sourceArgs,
        datasetFields,
        req,
    });

    req.ctx.log('CONTROLS_DATASET_FIELDS_PROCESSED');

    return {
        ...source,
        data,
    };
};
