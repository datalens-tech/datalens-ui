import _, {pick} from 'lodash';
import type {DeepNonNullable} from 'utility-types';
import {z} from 'zod/v4';

import Dash from '../../../../server/components/sdk/dash';
import {DASH_ENTRY_RELEVANT_FIELDS} from '../../../../server/constants';
import {dashSchema} from '../../../sdk/zod-schemas/dash-api.schema';
import type {ChartsStats} from '../../../types/charts';
import {EntryScope} from '../../../types/common';
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
    type CollectChartkitStatsArgs,
    type CollectChartkitStatsResponse,
    type CollectDashStatsArgs,
    type CollectDashStatsResponse,
    type GetEntriesDatasetsFieldsArgs,
    type GetEntriesDatasetsFieldsResponse,
    type GetWidgetsDatasetsFieldsArgs,
    type GetWidgetsDatasetsFieldsResponse,
} from '../types';

const dashUsSchema = z.object({
    ...dashSchema.shape,
    entryId: z.string(),
    scope: z.literal(EntryScope.Dash),
    public: z.boolean(),
    isFavorite: z.boolean(),
    createdAt: z.string(),
    createdBy: z.string(),
    updatedAt: z.string(),
    updatedBy: z.string(),
    revId: z.string(),
    savedId: z.string(),
    publishedId: z.string(),
    meta: z.record(z.string(), z.string()),
    links: z.record(z.string(), z.string()).optional(),
    key: z.union([z.null(), z.string()]),
    workbookId: z.union([z.null(), z.string()]),
    type: z.literal(''),
});

const dashUsCreateSchema = z.object({
    ...dashSchema.shape,
    workbookId: z.union([z.null(), z.string()]).optional(),
    lockToken: z.string().optional(),
    mode: z.literal(['publish', 'save']),
});

const dashUsUpdateSchema = z.object({
    ...dashSchema.partial().shape,
    entryId: z.string(),
});

export const dashActions = {
    // WIP
    getDashboard: createTypedAction(
        {
            paramsSchema: z.object({
                dashboardId: z.string(),
                revId: z.string().optional(),
                includePermissions: z.boolean().optional().default(false),
                includeLinks: z.boolean().optional().default(false),
                branch: z.literal(['published', 'saved']).optional().default('published'),
            }),
            resultSchema: dashUsSchema,
        },
        async (_, args, {headers, ctx}) => {
            const {dashboardId, includePermissions, includeLinks, branch, revId} = args;

            if (!dashboardId || dashboardId === 'null') {
                throw new Error(`Not found ${dashboardId} id`);
            }

            const result = await Dash.read(
                dashboardId,
                {
                    includePermissions: includePermissions ? includePermissions?.toString() : '0',
                    includeLinks: includeLinks ? includeLinks?.toString() : '0',
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

            return pick(result, DASH_ENTRY_RELEVANT_FIELDS) as any;
        },
    ),
    // WIP
    deleteDashboard: createTypedAction(
        {
            paramsSchema: z.object({
                dashboardId: z.string(),
                lockToken: z.string().optional(),
            }),
            resultSchema: z.any(),
        },
        async (api, {lockToken, dashboardId}) => {
            const typedApi = getTypedApi(api);

            await typedApi.us._deleteUSEntry({
                entryId: dashboardId,
                lockToken,
            });
        },
    ),
    // WIP
    updateDashboard: createTypedAction(
        {
            paramsSchema: dashUsUpdateSchema,
            resultSchema: dashUsSchema,
        },
        async (_, args, {headers, ctx}) => {
            const {entryId} = args;

            const I18n = ctx.get('i18n');

            return (await Dash.update(entryId as any, args as any, headers, ctx, I18n, {
                forceMigrate: true,
            })) as unknown as z.infer<typeof dashUsSchema>;
        },
    ),
    // WIP
    createDashboard: createTypedAction(
        {
            paramsSchema: dashUsCreateSchema,
            resultSchema: dashUsSchema,
        },
        async (_, args, {headers, ctx}) => {
            const I18n = ctx.get('i18n');

            return (await Dash.create(args as any, headers, ctx, I18n)) as unknown as z.infer<
                typeof dashUsSchema
            >;
        },
    ),

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
};
