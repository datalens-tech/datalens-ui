import z from 'zod';

import {getTypedApi} from '../../..';
import {ENTRY_TYPES, EntryScope} from '../../../..';
import {ServerError} from '../../../../constants/error';
import {createTypedAction} from '../../../gateway-utils';

const getQLChartArgsSchema = z.strictObject({
    chartId: z.string(),
    workbookId: z.string().nullable().optional(),
    revId: z.string().optional(),
    includePermissions: z.boolean().optional(),
    includeLinks: z.boolean().optional(),
    includeFavorite: z.boolean().optional(),
    branch: z.enum(['saved', 'published']).optional(),
});

const getQLChartResultSchema = z.unknown();

export const __getQLChart__ = createTypedAction(
    {
        paramsSchema: getQLChartArgsSchema,
        resultSchema: getQLChartResultSchema,
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
            !ENTRY_TYPES.ql.includes(getEntryResponse.type)
        ) {
            throw new ServerError('Entry not found', {
                status: 404,
            });
        }

        return getEntryResponse;
    },
);
