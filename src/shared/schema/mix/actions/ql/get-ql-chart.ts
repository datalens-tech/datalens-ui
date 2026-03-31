import {getTypedApi} from '../../..';
import {ENTRY_TYPES, EntryScope} from '../../../..';
import {ServerError} from '../../../../constants/error';
import {mapQlConfigToLatestVersion} from '../../../../modules/config/ql';
import {getTranslationFn} from '../../../../modules/language';
import {createTypedAction} from '../../../gateway-utils';
import {getQLChartArgsSchema, getQLChartResultSchema} from '../../schemas/ql';
import type {GetQLChartResult} from '../../types';

export const __getQLChart__ = createTypedAction(
    {
        paramsSchema: getQLChartArgsSchema,
        resultSchema: getQLChartResultSchema,
    },
    async (api, args, {ctx}): Promise<GetQLChartResult> => {
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

        if (getEntryResponse.data) {
            const shared = getEntryResponse.data.shared;

            const i18nServer = ctx.get('i18n');

            const mappedData =
                shared && typeof shared === 'string'
                    ? (mapQlConfigToLatestVersion(JSON.parse(shared), {
                          i18n: getTranslationFn(i18nServer.getI18nServer()),
                      }) as unknown as Record<string, unknown>)
                    : null;

            getEntryResponse.data = mappedData;
        }

        return getEntryResponse;
    },
);
