import z from 'zod/v4';

import {USProvider} from '../../../../server/components/charts-engine/components/storage/united-storage/provider';
import {v12ChartsConfigSchema} from '../../../sdk/zod-shemas/wizard-chart-api.schema';
import {EntryScope, WizardType} from '../../../types';
import {createTypedAction} from '../../gateway-utils';
import {getTypedApi} from '../../simple-schema';

const wizardUsSchema = z.object({
    data: z.object({
        shared: v12ChartsConfigSchema,
    }),
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
    getWizardChartApi: createTypedAction({
        argsSchema: z.object({
            chardId: z.string(),
            unreleased: z.boolean().default(false).optional(),
            revId: z.string().optional(),
            includePermissions: z.boolean().default(false).optional(),
            includeLinks: z.boolean().default(false).optional(),
        }),
        bodySchema: wizardUsSchema,
    }).withValidationSchema(async (_, args, {ctx, headers}) => {
        const {includePermissions, includeLinks, unreleased, revId, chardId} = args;

        const result = await USProvider.retrivePrasedWizardChart(ctx, {
            id: chardId,
            includePermissionsInfo: includePermissions ? includePermissions?.toString() : '0',
            includeLinks: includeLinks ? includeLinks?.toString() : '0',
            ...(revId ? {revId} : {}),
            ...(unreleased ? {unreleased} : {unreleased: false}),
            headers,
        });

        return result as any;
    }),
    deleteWizardChartApi: createTypedAction({
        argsSchema: z.object({
            chartId: z.string(),
        }),
        bodySchema: z.any(),
    }).withValidationSchema(async (api, {chartId}) => {
        const typedApi = getTypedApi(api);

        await typedApi.us._deleteUSEntry({
            entryId: chartId,
        });
    }),
};
