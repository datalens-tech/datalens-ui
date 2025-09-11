import {USProvider} from '../../../../server/components/charts-engine/components/storage/united-storage/provider';
import {EntryScope} from '../../../types';
import {createTypedAction} from '../../gateway-utils';
import {getTypedApi} from '../../simple-schema';
import {
    createWizardChartArgsSchema,
    createWizardChartResultSchema,
    deleteWizardChartArgsSchema,
    deleteWizardChartResultSchema,
    getWizardChartArgsSchema,
    getWizardChartResultSchema,
    updateWizardChartArgsSchema,
    updateWizardChartResultSchema,
} from '../schemas/wizard';

export const wizardActions = {
    // WIP
    __getWizardChart__: createTypedAction(
        {
            paramsSchema: getWizardChartArgsSchema,
            resultSchema: getWizardChartResultSchema,
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
    // WIP
    __createWizardChart__: createTypedAction(
        {
            paramsSchema: createWizardChartArgsSchema,
            resultSchema: createWizardChartResultSchema,
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
    // WIP
    __updateWizardChart__: createTypedAction(
        {
            paramsSchema: updateWizardChartArgsSchema,
            resultSchema: updateWizardChartResultSchema,
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
    // WIP
    __deleteWizardChart__: createTypedAction(
        {
            paramsSchema: deleteWizardChartArgsSchema,
            resultSchema: deleteWizardChartResultSchema,
        },
        async (api, {chartId}) => {
            const typedApi = getTypedApi(api);

            await typedApi.us._deleteUSEntry({
                entryId: chartId,
            });

            return {};
        },
    ),
};
