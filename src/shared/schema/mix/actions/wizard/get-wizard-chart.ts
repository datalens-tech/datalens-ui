import z from 'zod';

import {getTypedApi} from '../../..';
import {ENTRY_TYPES, EntryScope, mapChartsConfigToLatestVersion} from '../../../..';
import {ServerError} from '../../../../constants/error';
import {createTypedAction} from '../../../gateway-utils';

const getWizardChartArgsSchema = z.strictObject({
    chartId: z.string(),
    workbookId: z.string().nullable().optional(),
    revId: z.string().optional(),
    includePermissions: z.boolean().optional(),
    includeLinks: z.boolean().optional(),
    includeFavorite: z.boolean().optional(),
    branch: z.enum(['saved', 'published']).optional(),
});

const getWizardChartResultSchema = z.unknown();

export const __getWizardChart__ = createTypedAction(
    {
        paramsSchema: getWizardChartArgsSchema,
        resultSchema: getWizardChartResultSchema,
    },
    async (api, args): Promise<any> => {
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
);
