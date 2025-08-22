import type {AppRoutes} from '@gravity-ui/expresskit';
import {ExpressKit} from '@gravity-ui/expresskit';
import type {NodeKit} from '@gravity-ui/nodekit';

import type {ExtendedAppRouteDescription} from './types/controllers';

export function getExpressKit({
    extendedRoutes,
    nodekit,
}: {
    extendedRoutes: Record<string, ExtendedAppRouteDescription>;
    nodekit: NodeKit;
}) {
    const routes: AppRoutes = {};
    Object.keys(extendedRoutes).forEach((key) => {
        const {route, guard, ...params} = extendedRoutes[key];
        if (guard) {
            params.afterAuth = [...params.afterAuth, guard];
        }
        routes[route] = params;
    });

    const app = new ExpressKit(nodekit, routes);

    return app;
}
