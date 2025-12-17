import {getTypedApi} from '../../..';
import {ENTRY_TYPES, EntryScope, mapChartsConfigToLatestVersion} from '../../../..';
import {ServerError} from '../../../../constants/error';
import {createTypedAction} from '../../../gateway-utils';
import {getWizardChartArgsSchema, getWizardChartResultSchema} from '../../schemas/wizard';
import type {GetWizardResult} from '../../types';

// WIP
export const __getWizardChart__ = createTypedAction(
    {
        paramsSchema: getWizardChartArgsSchema,
        resultSchema: getWizardChartResultSchema,
    },
    async (api, args): Promise<GetWizardResult> => {
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

        const getEntryResponse = await typedApi.us._getEntryWithAudit({
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
);
