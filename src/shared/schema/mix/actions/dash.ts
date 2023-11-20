import {ContextApiWithRoot} from '@gravity-ui/gateway/build/models/common';
import {AppContext} from '@gravity-ui/nodekit';
import {DeepNonNullable} from 'utility-types';

import {Dataset} from '../../../types';
import {createAction} from '../../gateway-utils';
import {getTypedApi, simpleSchema} from '../../simple-schema';
import {
    CollectDashStatsArgs,
    CollectDashStatsResponse,
    GetEntriesDatasetsFieldsArgs,
    GetEntriesDatasetsFieldsListItem,
    GetEntriesDatasetsFieldsResponse,
} from '../types';

type DatasetDictResponse = {datasetId: string; data: Dataset | null};

const fetchAllDatasets = async ({
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

const prepareDatasetData = (args: {
    items: DatasetDictResponse;
    type: string | null;
    entryId: string;
    datasetId: string;
    isLightFormat: boolean;
}) => {
    const {isLightFormat, entryId, datasetId, type, items} = args;

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
            if (isLightFormat) {
                return guid;
            }
            return {
                title,
                guid,
                type: fieldType,
            };
        }) as GetEntriesDatasetsFieldsListItem[] | string[],
    };
};

export const dashActions = {
    collectDashStats: createAction<CollectDashStatsResponse, CollectDashStatsArgs>(
        async (_, args, {ctx}) => {
            ctx.stats('dashStats', {
                datetime: Date.now(),
                ...(args as DeepNonNullable<CollectDashStatsArgs>),
            });
            return {status: 'success'};
        },
    ),
    // in the entriesIds, the id of the entities for which you need to find out the dataset,
    // and if the dataset id is not in datasetsIds, then you need to get a list of dataset fields
    getEntriesDatasetsFields: createAction<
        GetEntriesDatasetsFieldsResponse,
        GetEntriesDatasetsFieldsArgs
    >(async (api, {entriesIds, datasetsIds, format}, {ctx}) => {
        const typedApi = getTypedApi(api);
        const {entries} = await typedApi.us.getEntries({
            scope: 'widget',
            ids: entriesIds,
            includeLinks: true,
        });

        const isLightFormat = format === 'light';

        const allDatasetsIdsSet = new Set([...datasetsIds]);
        entries.forEach((entry) => {
            const {links, meta} = entry;
            const {dataset} = links || {};
            // deprecated
            const {datasetId: metaDatasetId} = meta || {};
            const datasetId = (dataset || metaDatasetId) as string | undefined;
            if (datasetId) {
                allDatasetsIdsSet.add(datasetId);
            }
        });

        const allDatasetsIds = [...allDatasetsIdsSet];
        const allDatasetsPromises = allDatasetsIds.map((datasetId) =>
            fetchAllDatasets({datasetId, typedApi, ctx}),
        );

        const allDatasetsFetchedData = await Promise.all([...allDatasetsPromises]);
        const allDatasetsFetchedDataDict = allDatasetsFetchedData
            .filter((item) => Boolean(item.data && item.datasetId))
            .reduce((res: Record<string, DatasetDictResponse>, item: DatasetDictResponse) => {
                res[item.datasetId] = {...item};
                return res;
            }, {});

        const res: GetEntriesDatasetsFieldsResponse = [];
        entries.forEach((entry) => {
            const {links, meta, type, entryId} = entry;
            const {dataset} = links || {};
            // deprecated
            const {datasetId: metaDatasetId} = meta || {};
            const datasetId = (dataset || metaDatasetId) as string | undefined;
            if (datasetId) {
                const widgetType = type.match(/^[^_]*/)?.[0] || null;
                res.push(
                    prepareDatasetData({
                        items: allDatasetsFetchedDataDict[datasetId],
                        type: widgetType,
                        datasetId,
                        entryId,
                        isLightFormat,
                    }),
                );
            }
        });
        datasetsIds.forEach((datasetId) => {
            res.push(
                prepareDatasetData({
                    items: allDatasetsFetchedDataDict[datasetId],
                    type: 'dataset',
                    entryId: datasetId,
                    datasetId,
                    isLightFormat,
                }),
            );
        });
        return res;
    }),
};
