import {getResultSchemaFromDataset} from '../../../../../../shared';
import type {PartialDatasetField} from '../../../../../../shared/schema';
import type Cache from '../../../../../components/cache-client';
import {getUrlsRequestBody} from '../../datalens/url/build-request-body';
import {getDatasetIdAndLayerIdFromKey} from '../../helpers/misc';
import type {MiddlewareSourceAdapterArgs} from '../../types';
import type {ConfigurableRequestWithDatasetPluginOptions} from '../index';
import {getDatasetFields} from '../request-dataset';

export default async (
    args: MiddlewareSourceAdapterArgs & {
        pluginOptions?: ConfigurableRequestWithDatasetPluginOptions;
    },
) => {
    const {
        source,
        sourceName,
        req,
        ChartsEngine,
        userId,
        iamToken,
        workbookId,
        rejectFetchingSource,
        pluginOptions,
    } = args;

    const cacheClient = ChartsEngine.cacheClient as Cache;

    const [datasetId, layerId] = getDatasetIdAndLayerIdFromKey(sourceName);

    const urlsSourceArgs = source.sourceArgs;

    const shared = urlsSourceArgs.shared;
    const wizardDataset = shared.wizardDataset;

    let revisionId: string;
    let datasetFields: PartialDatasetField[];

    // When Urls are executed on the Wizard side, we don't need a dataset from the CHARTS side to avoid an unnecessary request
    // Since we get it when loading the chart into Wizard and put it in the api request arguments/run
    // the dataset is stored in shared.dataset
    if (wizardDataset && wizardDataset.id === datasetId) {
        revisionId = wizardDataset.dataset.revisionId;
        datasetFields = getResultSchemaFromDataset(wizardDataset);
    } else {
        const datasetFieldsResponse = await getDatasetFields({
            datasetId,
            workbookId: workbookId ?? null,
            req,
            cacheClient,
            userId,
            iamToken,
            rejectFetchingSource,
            pluginOptions,
        });

        revisionId = datasetFieldsResponse.revisionId;
        datasetFields = datasetFieldsResponse.datasetFields;
    }

    req.ctx.log('CHARTS_DATASET_FIELDS_RECEIVED', {
        count: datasetFields.length,
    });

    const data = getUrlsRequestBody({
        params: source.sourceArgs.params,
        shared: source.sourceArgs.shared,
        apiVersion: source.sourceArgs.apiVersion,
        datasetId,
        datasetFields,
        layerId,
        revisionId,
    });

    req.ctx.log('CHARTS_DATASET_FIELDS_PROCESSED');

    return {...source, data};
};
