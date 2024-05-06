import type {AppMiddleware, AppRouteDescription} from '@gravity-ui/expresskit';
import type {HttpMethod} from '@gravity-ui/expresskit/dist/types';

export interface CSPPolicies {
    [key: string]: string[];
}

export type ExtendedAppRouteDescription = AppRouteDescription & {
    route: `${Uppercase<HttpMethod>} ${string}`;
    ui?: boolean;
    beforeAuth: AppMiddleware[];
    afterAuth: AppMiddleware[];
    disableUserSettings?: boolean;
    apiRoute?: boolean;
    cspPresets?: CSPPolicies[];
    disableCsrf?: boolean;
};

export type BasicControllers =
    | 'dl-main'
    | 'navigate'
    | 'navigation'
    | 'api.deleteLock'
    | 'schematic-gateway';
