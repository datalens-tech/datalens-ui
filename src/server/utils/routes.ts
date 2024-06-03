import {api, dlMain, navigate, navigation} from '../controllers';
import {registry} from '../registry';
import type {BasicControllers, ExtendedAppRouteDescription} from '../types/controllers';

export const getConfiguredRoute = (
    controllerName: BasicControllers,
    params: Omit<ExtendedAppRouteDescription, 'handler'>,
): ExtendedAppRouteDescription => {
    switch (controllerName) {
        case 'navigate':
            return {
                handler: navigate,
                ...params,
            };
        case 'api.deleteLock':
            return {
                handler: api.deleteLock,
                ...params,
            };
        case 'dl-main':
            return {
                handler: dlMain,
                ...params,
            };
        case 'navigation':
            return {
                handler: navigation,
                ...params,
            };
        case 'schematic-gateway': {
            const {gatewayController} = registry.getGatewayController();

            return {
                handler: gatewayController,
                ...params,
            };
        }
        default:
            return null as never;
    }
};
