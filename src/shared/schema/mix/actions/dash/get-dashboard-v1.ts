import z from 'zod';

import {getTypedApi} from '../../..';
import {EntryScope} from '../../../..';
import {registerComponentId} from '../../../../components/public-api/utils';
import {ServerError} from '../../../../constants/error';
import {permissionsSchema} from '../../../../zod-schemas/permissions';
import {createTypedAction} from '../../../gateway-utils';
import {migrateDashToV1} from '../../helpers/dash/migrate-dash-to-v1';
import {dashSchemaV1} from '../../schemas/dash';

export const getDashArgsSchema = z
    .object({
        dashboardId: z.string(),
        revId: z.string().optional(),
        includePermissions: z.boolean().optional().default(false),
        includeLinks: z.boolean().optional().default(false),
        includeFavorite: z.boolean().optional().default(false),
        branch: z.enum(['published', 'saved']).optional(),
        workbookId: z.string().optional(),
    })
    .openapi(registerComponentId('GetDashboardArgs'), {
        title: 'GetDashboardArgs',
    });

export const getDashResultSchema = z
    .object({
        entry: dashSchemaV1,
        isFavorite: z.boolean().optional(),
        permissions: permissionsSchema.optional(),
    })
    .openapi(registerComponentId('GetDashboardResult'), {
        title: 'GetDashboardResult',
    });

export const getDashboardV1 = createTypedAction(
    {
        paramsSchema: getDashArgsSchema,
        resultSchema: getDashResultSchema,
    },
    async (api, args): Promise<any> => {
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

        const getEntryResponse = await typedApi.us.getEntry({
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
