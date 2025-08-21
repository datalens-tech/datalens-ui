import {
    apiControllers,
    dlMainController,
    navigateController,
    navigationController,
    publicApiControllerGetter,
} from '../controllers';
import {registry} from '../registry';
import type {BasicControllers, ExtendedAppRouteDescription} from '../types/controllers';

export const getConfiguredRoute = (
    controllerName: BasicControllers,
    params: Omit<ExtendedAppRouteDescription, 'handler'>,
): ExtendedAppRouteDescription => {
    switch (controllerName) {
        case 'navigate':
            return {
                handler: navigateController,
                ...params,
            };
        case 'api.deleteLock':
            return {
                handler: apiControllers.deleteLock,
                ...params,
            };
        case 'dl-main':
            return {
                handler: dlMainController,
                ...params,
            };
        case 'navigation':
            return {
                handler: navigationController,
                ...params,
            };
        case 'schematic-gateway': {
            const {gatewayController} = registry.getGatewayController();

            return {
                handler: gatewayController,
                ...params,
            };
        }
        case 'public-api': {
            return {
                handler: publicApiControllerGetter(params),
                ...params,
            };
        }
        default:
            return null as never;
    }
};
