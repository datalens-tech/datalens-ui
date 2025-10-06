import type {DeepNonNullable} from 'utility-types';

import {EntryScope} from '../../..';
import Dash from '../../../../server/components/sdk/dash';
import type {ChartsStats} from '../../../types/charts';
import {createAction, createTypedAction} from '../../gateway-utils';
import {getTypedApi} from '../../simple-schema';
import {getEntryVisualizationType} from '../helpers';
import type {DatasetDictResponse, DatasetFieldsDictResponse} from '../helpers/dash';
import {
    fetchDataset,
    fetchDatasetFieldsById,
    prepareDatasetData,
    prepareWidgetDatasetData,
} from '../helpers/dash';
import {
    createDashArgsSchema,
    createDashResultSchema,
    deleteDashArgsSchema,
    deleteDashResultSchema,
    getDashArgsSchema,
    getDashResultSchema,
    updateDashArgsSchema,
    updateDashResultSchema,
} from '../schemas/dash';
import type {
    CollectChartkitStatsArgs,
    CollectChartkitStatsResponse,
    CollectDashStatsArgs,
    CollectDashStatsResponse,
    CreateDashResponse,
    GetEntriesDatasetsFieldsArgs,
    GetEntriesDatasetsFieldsResponse,
    GetWidgetsDatasetsFieldsArgs,
    GetWidgetsDatasetsFieldsResponse,
    UpdateDashResponse,
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
    collectChartkitStats: createAction<CollectChartkitStatsResponse, CollectChartkitStatsArgs>(
        async (_, args, {ctx}) => {
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
    >(async (api, {entriesIds, datasetsIds, workbookId}, {ctx}) => {
        const typedApi = getTypedApi(api);
        const {entries} = await typedApi.us.getEntries({
            scope: 'widget',
            ids: entriesIds,
            includeLinks: true,
            includeData: true,
        });

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
    }),
    getWidgetsDatasetsFields: createAction<
        GetWidgetsDatasetsFieldsResponse,
        GetWidgetsDatasetsFieldsArgs
    >(async (api, {entriesIds, workbookId}, opt) => {
        const {ctx, headers} = opt;
        const typedApi = getTypedApi(api);

        const {entries} = await typedApi.us.getEntries({
            scope: 'widget',
            ids: entriesIds,
            includeLinks: true,
        });

        const allDatasetsIdsSet = new Set();
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
        });
        return res;
    }),

    // WIP
    __getDashboard__: createTypedAction(
        {
            paramsSchema: getDashArgsSchema,
            resultSchema: getDashResultSchema,
        },
        async (_, args, {headers, ctx}) => {
            const {dashboardId, includePermissions, includeLinks, includeFavorite, branch, revId} =
                args;

            const result = await Dash.read(
                dashboardId,
                {
                    includePermissions: includePermissions ? includePermissions.toString() : '0',
                    includeLinks: includeLinks ? includeLinks.toString() : '0',
                    includeFavorite,
                    ...(branch ? {branch} : {branch: 'published'}),
                    ...(revId ? {revId} : {}),
                },
                headers,
                ctx,
                {forceMigrate: true},
            );

            if (result.scope !== EntryScope.Dash) {
                throw new Error('No entry found');
            }

            return result as any;
        },
    ),

    // WIP
    __updateDashboard__: createTypedAction(
        {
            paramsSchema: updateDashArgsSchema,
            resultSchema: updateDashResultSchema,
        },
        async (_, args, {headers, ctx}) => {
            const {entryId} = args;

            const I18n = ctx.get('i18n');

            return (await Dash.update(entryId, args, headers, ctx, I18n, {
                forceMigrate: true,
            })) as unknown as UpdateDashResponse;
        },
    ),
    // WIP
    __createDashboard__: createTypedAction(
        {
            paramsSchema: createDashArgsSchema,
            resultSchema: createDashResultSchema,
        },
        async (_, args, {headers, ctx}) => {
            const I18n = ctx.get('i18n');

            return (await Dash.create(args, headers, ctx, I18n)) as unknown as CreateDashResponse;
        },
    ),

    // WIP
    __deleteDashboard__: createTypedAction(
        {
            paramsSchema: deleteDashArgsSchema,
            resultSchema: deleteDashResultSchema,
        },
        async (api, {lockToken, dashboardId}) => {
            const typedApi = getTypedApi(api);

            await typedApi.us._deleteUSEntry({
                entryId: dashboardId,
                lockToken,
                scope: EntryScope.Dash,
            });

            return {};
        },
    ),
};
