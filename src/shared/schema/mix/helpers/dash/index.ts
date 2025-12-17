import type {IncomingHttpHeaders} from 'http';

import type {ContextApiWithRoot} from '@gravity-ui/gateway/build/models/common';
import type {AppContext, AppContextParams} from '@gravity-ui/nodekit';

import type {schema} from '../../..';
import {registry} from '../../../../../server/registry';
import type {DatalensGatewaySchemas} from '../../../../../server/types/gateway';
import type {WizardVisualizationId} from '../../../../constants';
import type {DatasetField, WorkbookId} from '../../../../types';
import type {GetDataSetFieldsByIdResponse} from '../../../bi/types';
import type {GetEntryResponse} from '../../../us/types';

export type DatasetDictResponse = {datasetId: string; data: GetEntryResponse | null};

export const fetchDataset = async ({
    datasetId,
    workbookId,
    typedApi,
    ctx,
}: {
    datasetId: string;
    workbookId: WorkbookId;
    typedApi: ContextApiWithRoot<{root: typeof schema}>;
    ctx: AppContext;
}): Promise<DatasetDictResponse> => {
    try {
        const data: GetEntryResponse = await typedApi.us.getEntry({
            entryId: datasetId,
            workbookId,
        });

        return {
            datasetId,
            data,
        };
    } catch (error) {
        ctx.logError('DASH_FETCH_DATASET_BY_GET_ENTRY_FAILED', error);
    }
    return {datasetId, data: null};
};

export const prepareDatasetData = (args: {
    items: DatasetDictResponse;
    type: string | null;
    entryId: string;
    datasetId: string;
    visualizationType?: WizardVisualizationId;
}) => {
    const {entryId, datasetId, type, items, visualizationType} = args;

    const emptyValue = {entryId, type: null};

    if (!items?.data) {
        return emptyValue;
    }

    const {data, key} = items.data;

    const result_schema = data?.result_schema as DatasetField[];

    if (!result_schema) {
        return emptyValue;
    }

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
        visualizationType,
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
    workbookId,
    ctx,
    headers,
}: {
    datasetId: string;
    workbookId: WorkbookId;
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
                workbookId,
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
