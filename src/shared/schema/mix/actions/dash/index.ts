import type {DeepNonNullable} from 'utility-types';

import {getTypedApi} from '../../..';
import type {ChartsStats} from '../../../../types/charts';
import {createAction} from '../../../gateway-utils';
import {getEntryVisualizationType} from '../../helpers';
import type {DatasetDictResponse, DatasetFieldsDictResponse} from '../../helpers/dash';
import {
    fetchDataset,
    fetchDatasetFieldsById,
    prepareDatasetData,
    prepareWidgetDatasetData,
} from '../../helpers/dash';
import type {
    CollectChartkitStatsArgs,
    CollectChartkitStatsResponse,
    CollectDashStatsArgs,
    CollectDashStatsResponse,
    GetEntriesDatasetsFieldsArgs,
    GetEntriesDatasetsFieldsResponse,
    GetWidgetsDatasetsFieldsArgs,
    GetWidgetsDatasetsFieldsResponse,
} from '../../types';

import {createDashboardV1} from './create-dashboard-v1';
import {deleteDashboard} from './delete-dashboard';
import {getDashboardV1} from './get-dashboard-v1';
import {updateDashboardV1} from './update-dashboard-v1';

export const dashActions = {
    getDashboardV1,
    createDashboardV1,
    updateDashboardV1,
    deleteDashboard,

    collectDashStats: createAction<CollectDashStatsResponse, CollectDashStatsArgs>(
        async (_, args, {ctx}): Promise<CollectDashStatsResponse> => {
            ctx.stats('dashStats', {
                datetime: Date.now(),
                ...(args as DeepNonNullable<CollectDashStatsArgs>),
            });
            return {status: 'success'};
        },
    ),
    collectChartkitStats: createAction<CollectChartkitStatsResponse, CollectChartkitStatsArgs>(
        async (_, args, {ctx}): Promise<CollectChartkitStatsResponse> => {
            ctx.log('ChartKit stats collect', {rowsCount: args.length});

            args.forEach((data) => {
                ctx.stats('chartKitStats', {
                    datetime: new Date().toISOString().replace('T', ' ').split('.')[0],
                    ...(data as DeepNonNullable<ChartsStats>),
                });
            });
            return {status: 'success', rowsCount: args.length};
        },
    ),
    // in the entriesIds, the id of the entities for which you need to find out the dataset,
    // and if the dataset id is not in datasetsIds, then you need to get a list of dataset fields
    getEntriesDatasetsFields: createAction<
        GetEntriesDatasetsFieldsResponse,
        GetEntriesDatasetsFieldsArgs
    >(
        async (
            api,
            {entriesIds, datasetsIds, workbookId},
            {ctx},
        ): Promise<GetEntriesDatasetsFieldsResponse> => {
            const typedApi = getTypedApi(api);
            const {entries} = await typedApi.us.getEntries({
                scope: 'widget',
                ids: entriesIds,
                includeLinks: true,
                includeData: true,
            });

            const allDatasetsIdsSet = new Set([...datasetsIds]);
            entries.forEach((entry) => {
                if (!entry.isLocked) {
                    const {links, meta} = entry;
                    const {dataset} = links || {};
                    // deprecated
                    const {datasetId: metaDatasetId} = meta || {};
                    const datasetId = (dataset || metaDatasetId) as string | undefined;
                    if (datasetId) {
                        allDatasetsIdsSet.add(datasetId);
                    }
                }
            });

            const allDatasetsIds = [...allDatasetsIdsSet];
            const allDatasetsPromises = allDatasetsIds.map((datasetId) =>
                fetchDataset({datasetId, workbookId, typedApi, ctx}),
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
                if (!entry.isLocked) {
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
                                visualizationType: getEntryVisualizationType(entry),
                            }),
                        );
                    }
                }
            });
            datasetsIds.forEach((datasetId) => {
                res.push(
                    prepareDatasetData({
                        items: allDatasetsFetchedDataDict[datasetId],
                        type: 'dataset',
                        entryId: datasetId,
                        datasetId,
                    }),
                );
            });
            return res;
        },
    ),
    getWidgetsDatasetsFields: createAction<
        GetWidgetsDatasetsFieldsResponse,
        GetWidgetsDatasetsFieldsArgs
    >(async (api, {entriesIds, workbookId}, opt): Promise<GetWidgetsDatasetsFieldsResponse> => {
        const {ctx, headers} = opt;
        const typedApi = getTypedApi(api);

        const {entries} = await typedApi.us.getEntries({
            scope: 'widget',
            ids: entriesIds,
            includeLinks: true,
        });

        const allDatasetsIdsSet = new Set();
        entries.forEach((entry) => {
            if (!entry.isLocked) {
                const {links, meta} = entry;
                const {dataset} = links || {};
                // deprecated
                const {datasetId: metaDatasetId} = meta || {};
                const datasetId = (dataset || metaDatasetId) as string | undefined;
                if (datasetId) {
                    allDatasetsIdsSet.add(datasetId);
                }
            }
        });

        const allDatasetsIds = [...allDatasetsIdsSet] as string[];
        const allDatasetsPromises = allDatasetsIds.map((datasetId) =>
            fetchDatasetFieldsById({datasetId, workbookId, ctx, headers}),
        );

        const allDatasetsFetchedData = await Promise.all([...allDatasetsPromises]);

        const allDatasetsFetchedDataDict = allDatasetsFetchedData
            .filter((item) => Boolean(item.data && item.datasetId))
            .reduce(
                (
                    res: Record<string, DatasetFieldsDictResponse>,
                    item: DatasetFieldsDictResponse,
                ) => {
                    res[item.datasetId] = {...item};
                    return res;
                },
                {},
            );

        const res: GetWidgetsDatasetsFieldsResponse = [];
        entries.forEach((entry) => {
            if (!entry.isLocked) {
                const {links, meta, entryId} = entry;
                const {dataset} = links || {};
                // deprecated
                const {datasetId: metaDatasetId} = meta || {};
                const datasetId = (dataset || metaDatasetId) as string | undefined;
                if (datasetId) {
                    res.push(
                        prepareWidgetDatasetData({
                            items: allDatasetsFetchedDataDict[datasetId],
                            datasetId,
                            entryId,
                        }),
                    );
                }
            }
        });
        return res;
    }),
};
