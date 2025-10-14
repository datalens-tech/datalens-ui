import {ENTRY_TYPES, EntryScope, mapChartsConfigToLatestVersion} from '../../..';
import {ServerError} from '../../../constants/error';
import {createTypedAction} from '../../gateway-utils';
import {getTypedApi} from '../../simple-schema';
import {
    deleteWizardChartArgsSchema,
    deleteWizardChartResultSchema,
    getWizardChartArgsSchema,
    getWizardChartResultSchema,
} from '../schemas/wizard';

export const wizardActions = {
    // WIP
    __getWizardChart__: createTypedAction(
        {
            paramsSchema: getWizardChartArgsSchema,
            resultSchema: getWizardChartResultSchema,
        },
        async (api, args) => {
            const {
                includePermissions,
                includeLinks,
                includeFavorite = false,
                revId,
                chartId,
                branch,
                workbookId,
            } = args;

            const typedApi = getTypedApi(api);

            const getEntryResponse = await typedApi.us.getEntry({
                entryId: chartId,
                includePermissionsInfo: includePermissions,
                includeLinks,
                includeFavorite,
                revId,
                workbookId,
                branch: branch ?? 'published',
            });

            if (
                getEntryResponse.scope !== EntryScope.Widget ||
                !ENTRY_TYPES.wizard.includes(getEntryResponse.type)
            ) {
                throw new ServerError('Entry not found', {
                    status: 404,
                });
            }

            if (getEntryResponse.data) {
                const mappedData = mapChartsConfigToLatestVersion(
                    JSON.parse(getEntryResponse.data.shared as string),
                );

                getEntryResponse.data.shared = JSON.stringify(mappedData);
            }

            return getEntryResponse;
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
                scope: EntryScope.Widget,
                types: ENTRY_TYPES.wizard,
            });

            return {};
        },
    ),
};
