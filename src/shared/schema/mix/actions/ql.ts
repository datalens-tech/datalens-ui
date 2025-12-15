import {getTypedApi} from '../..';
import {ENTRY_TYPES, EntryScope} from '../../..';
import {ServerError} from '../../../constants/error';
import {createTypedAction} from '../../gateway-utils';
import {
    deleteQLChartArgsSchema,
    deleteQLChartResultSchema,
    getQLChartArgsSchema,
    getQLChartResultSchema,
} from '../schemas/ql';
import type {DeleteQLChartResult, GetQLChartResult} from '../types';

export const qlActions = {
    // WIP
    __getQLChart__: createTypedAction(
        {
            paramsSchema: getQLChartArgsSchema,
            resultSchema: getQLChartResultSchema,
        },
        async (api, args): Promise<GetQLChartResult> => {
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
                !ENTRY_TYPES.ql.includes(getEntryResponse.type)
            ) {
                throw new ServerError('Entry not found', {
                    status: 404,
                });
            }

            return getEntryResponse;
        },
    ),

    deleteQLChart: createTypedAction(
        {
            paramsSchema: deleteQLChartArgsSchema,
            resultSchema: deleteQLChartResultSchema,
        },
        async (api, {chartId}): Promise<DeleteQLChartResult> => {
            const typedApi = getTypedApi(api);

            await typedApi.us._deleteUSEntry({
                entryId: chartId,
                scope: EntryScope.Widget,
                types: ENTRY_TYPES.ql,
            });

            return {};
        },
    ),
};
