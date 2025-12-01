import z from 'zod';

import {registerComponentId} from '../../../../components/public-api/utils';
import {permissionsSchema} from '../../../../zod-schemas/permissions';

import {dashSchemaV1} from './dash-v1';

export const getDashV1ArgsSchema = z
    .object({
        dashboardId: z.string(),
        revId: z.string().optional(),
        includePermissions: z.boolean().optional(),
        includeLinks: z.boolean().optional(),
        includeFavorite: z.boolean().optional(),
        branch: z.enum(['published', 'saved']).optional(),
        workbookId: z.string().optional(),
    })
    .openapi(registerComponentId('GetDashboardArgs'), {
        title: 'GetDashboardArgs',
    });

export const getDashV1ResultSchema = z
    .object({
        entry: dashSchemaV1,
        isFavorite: z.boolean().optional(),
        permissions: permissionsSchema.optional(),
    })
    .openapi(registerComponentId('GetDashboardResult'), {
        title: 'GetDashboardResult',
    });
