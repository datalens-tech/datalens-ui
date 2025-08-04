import z from 'zod/v4';

import {USProvider} from '../../../../server/components/charts-engine/components/storage/united-storage/provider';
import {v12ChartsConfigSchema} from '../../../sdk/zod-shemas/wizard-chart-api.schema';
import {createTypedAction} from '../../gateway-utils';
import {getTypedApi} from '../../simple-schema';

export const wizardActions = {
    getWizardChartApi: createTypedAction({
        argsSchema: z.object({
            chardId: z.string(),
            unreleased: z.boolean().default(false).optional(),
            revId: z.string().optional(),
            includePermissions: z.boolean().default(false).optional(),
            includeLinks: z.boolean().default(false).optional(),
        }),
        bodySchema: v12ChartsConfigSchema,
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
