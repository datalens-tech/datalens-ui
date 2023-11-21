import {IncomingHttpHeaders} from 'http';

import {ContextApiWithRoot} from '@gravity-ui/gateway/build/models/common';
import {AppContext, AppContextParams} from '@gravity-ui/nodekit';

import {registry} from '../../../../server/registry';
import {DatalensGatewaySchemas} from '../../../../server/types/gateway';
import {Dataset} from '../../../types';
import {GetDataSetFieldsByIdResponse} from '../../bi/types';
import {simpleSchema} from '../../simple-schema';

export type DatasetDictResponse = {datasetId: string; data: Dataset | null};

export const fetchDataset = async ({
    datasetId,
    typedApi,
    ctx,
}: {
    datasetId: string;
    typedApi: ContextApiWithRoot<{root: typeof simpleSchema}>;
    ctx: AppContext;
}): Promise<DatasetDictResponse> => {
    try {
        const data: Dataset = await typedApi.bi.getDatasetByVersion({
            datasetId,
            version: 'draft',
        });
        return {
            datasetId,
            data,
        };
    } catch (error) {
        ctx.logError('DASH_GET_DATASETS_BY_IDS_FIELDS_GET_DATASET_BY_VERSION_FAILED', error);
    }
    return {datasetId, data: null};
};

export const prepareDatasetData = (args: {
    items: DatasetDictResponse;
    type: string | null;
    entryId: string;
    datasetId: string;
}) => {
    const {entryId, datasetId, type, items} = args;

    if (!items.data) {
        return {entryId, type: null};
    }

    const {
        key,
        dataset: {result_schema},
    } = items.data;

    // we form an array of elements of the following type:
    // * wizard and dataset are not in datasetsIds
    //   {entryId: "0tk6pkyusg", type: "graph_wizard_node", datasetId: "3a3em9nwkk", datasetFields: Array(8)}
    // * wizard and dataset are in datasetsIds
    //   {entryId: "0lwgk7z2kw", type: "graph_wizard_node", datasetId: "fbnaupoasc"}
    // * wizard that doesn't have a datasetId in meta
    //   {entryId: "0epkfeanqv", type: "graph_wizard_node"}
    // * node script
    //   {entryId: "ilslg0le88", type: "graph_node"}
    return {
        entryId,
        type,
        datasetId,
        datasetName: key.match(/[^/]*$/)?.[0] || '',
        datasetFields: result_schema.map(({title, guid, type: fieldType}) => {
            return {
                title,
                guid,
                type: fieldType,
            };
        }),
    };
};

type DatasetFieldsData = {
    responseData: GetDataSetFieldsByIdResponse;
};

export type DatasetFieldsDictResponse = {
    datasetId: string;
    data: DatasetFieldsData | null;
};

export const prepareWidgetDatasetData = (args: {
    items: DatasetFieldsDictResponse;
    entryId: string;
    datasetId: string;
}) => {
    const {entryId, datasetId, items} = args;

    if (!items.data) {
        return {entryId};
    }

    return {
        entryId,
        datasetId,
        datasetFields: items.data.responseData.fields.map(({guid}) => guid),
    };
};

export const fetchDatasetFieldsById = async ({
    datasetId,
    ctx,
    headers,
}: {
    datasetId: string;
    ctx: AppContext;
    headers: IncomingHttpHeaders;
}): Promise<DatasetFieldsDictResponse> => {
    try {
        const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();
        const requestDatasetFields = gatewayApi.bi.getDataSetFieldsById;

        const {iamToken} = ctx.get('gateway') as AppContextParams['gateway'] & {iamToken: string};

        const data = await requestDatasetFields({
            ctx: ctx,
            headers: headers,
            requestId: ctx.getMetadata()?.[ctx.config.requestIdHeaderName],
            authArgs: {iamToken},
            args: {
                dataSetId: datasetId,
            },
        });

        return {
            datasetId,
            data,
        };
    } catch (error) {
        ctx.logError('DASH_GET_DATASET_FIELDS_BY_IDS_FIELDS_GET_DATASET_BY_VERSION_FAILED', error);
    }
    return {datasetId, data: null};
};
