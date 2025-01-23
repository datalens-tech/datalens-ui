import {AuthPolicy} from '@gravity-ui/expresskit';

import type {ExtendedAppRouteDescription} from '../../types/controllers';
import {getConfiguredRoute} from '../../utils/routes';

export function getAuthRoutes({
    routeParams,
}: {
    routeParams: Omit<ExtendedAppRouteDescription, 'handler' | 'route'>;
}) {
    const routes: Record<string, ExtendedAppRouteDescription> = {
        postAuthGateway: getConfiguredRoute('schematic-gateway', {
            authPolicy: AuthPolicy.disabled,
            route: 'POST /gateway/:scope(auth)/:service/:action?',
            ...routeParams,
        }),
    };

    return routes;
}
