import z from 'zod/v4';

import {USProvider} from '../../../../server/components/charts-engine/components/storage/united-storage/provider';
import {v12ChartsConfigSchema} from '../../../sdk/zod-shemas/wizard-chart-api.schema';
import {EntryScope, WizardType} from '../../../types';
import {createTypedAction} from '../../gateway-utils';
import {getTypedApi} from '../../simple-schema';

const wizardUsSchema = z.object({
    data: v12ChartsConfigSchema,
    entryId: z.string(),
    scope: z.literal(EntryScope.Widget),
    type: z.enum(WizardType),
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
});

export const wizardActions = {
    getWizardChartApi: createTypedAction(
        {
            paramsSchema: z.object({
                chardId: z.string(),
                unreleased: z.boolean().default(false).optional(),
                revId: z.string().optional(),
                includePermissions: z.boolean().default(false).optional(),
                includeLinks: z.boolean().default(false).optional(),
            }),
            resultSchema: wizardUsSchema,
        },
        async (_, args, {ctx, headers}) => {
            const {includePermissions, includeLinks, unreleased, revId, chardId} = args;

            const result = await USProvider.retrieveParsedWizardChart(ctx, {
                id: chardId,
                includePermissionsInfo: includePermissions ? includePermissions?.toString() : '0',
                includeLinks: includeLinks ? includeLinks?.toString() : '0',
                ...(revId ? {revId} : {}),
                ...(unreleased ? {unreleased} : {unreleased: false}),
                headers,
            });

            return result as any;
        },
    ),
    createWizardChartApi: createTypedAction(
        {
            paramsSchema: z.object({
                entryId: z.string(),
                data: v12ChartsConfigSchema,
                key: z.string(),
                workbookId: z.union([z.string(), z.null()]).optional(),
                type: z.enum(WizardType).optional(),
                name: z.string(),
            }),
            resultSchema: wizardUsSchema,
        },
        async (_, args, {ctx, headers}) => {
            const {data, type, key, workbookId, name} = args;

            const result = await USProvider.create(ctx, {
                type,
                data,
                key,
                name,
                scope: EntryScope.Widget,
                ...(workbookId ? {workbookId} : {workbookId: null}),
                headers,
            });

            return result as any;
        },
    ),
    updateWizardChartApi: createTypedAction(
        {
            paramsSchema: z.object({
                entryId: z.string(),
                revId: z.string().optional(),
                data: v12ChartsConfigSchema,
                type: z.enum(WizardType).optional(),
            }),
            resultSchema: wizardUsSchema,
        },
        async (_, args, {ctx, headers}) => {
            const {entryId, revId, data, type} = args;

            const result = await USProvider.update(ctx, {
                entryId,
                ...(revId ? {revId} : {}),
                ...(type ? {type} : {}),
                data,
                headers,
            });

            return result as any;
        },
    ),
    deleteWizardChartApi: createTypedAction(
        {
            paramsSchema: z.object({
                chartId: z.string(),
            }),
            resultSchema: z.any(),
        },
        async (api, {chartId}) => {
            const typedApi = getTypedApi(api);

            await typedApi.us._deleteUSEntry({
                entryId: chartId,
            });
        },
    ),
};
