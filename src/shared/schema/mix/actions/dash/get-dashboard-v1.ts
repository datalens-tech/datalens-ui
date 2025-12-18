import type {GetDashV1Result} from '../../..';
import {getTypedApi} from '../../..';
import {EntryScope} from '../../../..';
import {ServerError} from '../../../../constants/error';
import {createTypedAction} from '../../../gateway-utils';
import {migrateDashToV1} from '../../helpers/dash/migrate-dash-to-v1';
import {getDashV1ArgsSchema, getDashV1ResultSchema} from '../../schemas/dash/get-dashboard-v1';

export const getDashboardV1 = createTypedAction(
    {
        paramsSchema: getDashV1ArgsSchema,
        resultSchema: getDashV1ResultSchema,
    },
    async (api, args): Promise<GetDashV1Result> => {
        const {
            dashboardId,
            includePermissions,
            includeLinks,
            includeFavorite,
            branch,
            revId,
            workbookId,
        } = args;

        const typedApi = getTypedApi(api);

        const getEntryResponse = await typedApi.us._getEntryWithAudit({
            entryId: dashboardId,
            includePermissionsInfo: includePermissions,
            includeLinks,
            includeFavorite,
            revId,
            workbookId,
            branch: branch ?? 'published',
        });

        if (getEntryResponse.scope !== EntryScope.Dash) {
            throw new ServerError('No entry found', {
                status: 404,
            });
        }

        const entry = migrateDashToV1(getEntryResponse);

        return {
            entry,
            isFavorite: getEntryResponse.isFavorite,
            permissions: getEntryResponse.permissions,
        };
    },
);
