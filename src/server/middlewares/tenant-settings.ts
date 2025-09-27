import type {NextFunction, Request, Response} from '@gravity-ui/expresskit';
import {REQUEST_ID_PARAM_NAME} from '@gravity-ui/nodekit';

import {sharedRegistry} from '../../shared/registry';
import {onFail} from '../callbacks';
import {registry} from '../registry';
import type {DatalensGatewaySchemas} from '../types/gateway';

export function getTenantSettingsMiddleware() {
    async function resolveTenantSettings(req: Request, res: Response, next: NextFunction) {
        const {ctx} = req;

        const requestId = req.ctx.get(REQUEST_ID_PARAM_NAME);
        const currentTenantId = 'common';

        const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();
        const {getAuthArgsUSPrivate} = sharedRegistry.gatewayAuth.functions.getAll();
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
    }

    return function resolveTenantSettingsMiddleware(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        resolveTenantSettings(req, res, next)
            .catch((error) => {
                req.ctx.logError('TENANT_RESOLVED_FAILED', error);
                onFail(req, res);
            })
            .catch((error) => next(error));
    };
}
