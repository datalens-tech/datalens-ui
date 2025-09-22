import type {NextFunction, Request, Response} from '@gravity-ui/expresskit';
import {REQUEST_ID_PARAM_NAME} from '@gravity-ui/nodekit';

import {registry} from '../registry';
import type {DatalensGatewaySchemas} from '../types/gateway';

export function getTenantSettingsMiddleware() {
    return async function tenantSettingsMiddleware(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        const {ctx} = req;

        try {
            const requestId = req.ctx.get(REQUEST_ID_PARAM_NAME);
            const currentTenantId = 'common';

            const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();
            const {getAuthArgsUSPrivate} = registry.common.auth.getAll();
            const authArgsUSPrivate = getAuthArgsUSPrivate(req, res);

            const tenantDetailsResponce = await gatewayApi.usPrivate._getTenantDetails({
                ctx,
                headers: req.headers,
                requestId: requestId ?? '',
                authArgs: authArgsUSPrivate,
                args: {tenantId: currentTenantId},
            });
            const resolvedTenant = tenantDetailsResponce.responseData;
            res.locals.tenantDefaultColorPaletteId = resolvedTenant.settings?.defaultColorPaletteId;

            next();
        } catch (error) {
            ctx.logError('TENANT_RESOLVED_FAILED', error);

            next(error);
        }
    };
}
