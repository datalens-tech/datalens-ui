import {DeepNonNullable} from 'utility-types';

import {createAction} from '../../gateway-utils';
import {getTypedApi} from '../../simple-schema';
import {
    CollectDashStatsArgs,
    CollectDashStatsResponse,
    GetEntriesDatasetsFieldsArgs,
    GetEntriesDatasetsFieldsResponse,
} from '../types';

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
    // all comments were left by @smokiri
    // in the entriesIds, the id of the entities for which you need to find out the dataset,
    // and if the dataset id is not in datasetsIds, then you need to get a list of dataset fields
    getEntriesDatasetsFields: createAction<
        GetEntriesDatasetsFieldsResponse,
        GetEntriesDatasetsFieldsArgs
    >(async (api, {entriesIds, datasetsIds}, {ctx}) => {
        const typedApi = getTypedApi(api);
        const {entries} = await typedApi.us.getEntries({
            scope: 'widget',
            ids: entriesIds,
            includeLinks: true,
        });
        // we form an array of elements of the following type:
        // * wizard and dataset are not in datasetsIds
        //   {entryId: "0tk6pkyusg", type: "graph_wizard_node", datasetId: "3a3em9nwkk", datasetFields: Array(8)}
        // * wizard and dataset are in datasetsIds
        //   {entryId: "0lwgk7z2kw", type: "graph_wizard_node", datasetId: "fbnaupoasc"}
        // * wizard that doesn't have a datasetId in meta
        //   {entryId: "0epkfeanqv", type: "graph_wizard_node"}
        // * node script
        //   {entryId: "ilslg0le88", type: "graph_node"}
        const fetchEntries = entries.map(async (entry) => {
            const {entryId, type, meta, links} = entry;
            const {dataset} = links || {};
            // deprecated
            const {datasetId: metaDatasetId} = meta || {};
            const datasetId = (dataset || metaDatasetId) as string | undefined;
            const widgetType = type.match(/^[^_]*/)?.[0] || null;
            // datasetsIds is now ignored because you need to find out the name for all datasets
            // if (datasetsIds.includes(datasetId)) {
            //     return {entryId, type: widgetType, datasetId};
            // }
            if (datasetId) {
                try {
                    const {
                        key,
                        dataset: {result_schema},
                    } = await typedApi.bi.getDatasetByVersion({
                        datasetId,
                        version: 'draft',
                    });

                    return {
                        entryId,
                        type: widgetType,
                        datasetId,
                        datasetName: key.match(/[^/]*$/)?.[0] || '',
                        datasetFields: result_schema.map(({title, guid, type: fieldType}) => ({
                            title,
                            guid,
                            type: fieldType,
                        })),
                    };
                } catch (error) {
                    ctx.logError(
                        'DASH_GET_ENTRIES_DATASETS_FIELDS_GET_DATASET_BY_VERSION_FAILED',
                        error,
                    );
                }
            }
            return {entryId, type: widgetType};
        });
        const fetchDatasets = datasetsIds.map(async (datasetId) => {
            try {
                const {
                    key,
                    dataset: {result_schema},
                } = await typedApi.bi.getDatasetByVersion({
                    datasetId,
                    version: 'draft',
                });

                return {
                    entryId: datasetId,
                    type: 'dataset',
                    datasetId,
                    datasetName: key.match(/[^/]*$/)?.[0] || '',
                    datasetFields: result_schema.map(({title, guid, type: fieldType}) => ({
                        title,
                        guid,
                        type: fieldType,
                    })),
                };
            } catch (error) {
                ctx.logError(
                    'DASH_GET_DATASETS_BY_IDS_FIELDS_GET_DATASET_BY_VERSION_FAILED',
                    error,
                );
            }
            return {entryId: datasetId, type: null};
        });
        return await Promise.all([...fetchEntries, ...fetchDatasets]);
    }),
};
