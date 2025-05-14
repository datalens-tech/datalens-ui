import {getResultSchemaFromDataset} from '../../../../../../shared';
import type {PartialDatasetField} from '../../../../../../shared/schema';
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
        ctx,
        source,
        sourceName,
        cacheClient,
        userId,
        iamToken,
        workbookId,
        rejectFetchingSource,
        pluginOptions,
        zitadelParams,
        authParams,
        requestHeaders,
    } = args;

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
            ctx,
            cacheClient,
            userId,
            iamToken,
            rejectFetchingSource,
            pluginOptions,
            zitadelParams,
            authParams,
            requestHeaders,
        });

        revisionId = datasetFieldsResponse.revisionId;
        datasetFields = datasetFieldsResponse.datasetFields;
    }

    ctx.log('CHARTS_DATASET_FIELDS_RECEIVED', {
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
        ctx,
    });

    ctx.log('CHARTS_DATASET_FIELDS_PROCESSED');

    return {...source, data};
};
