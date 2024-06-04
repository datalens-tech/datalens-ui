import type {AppEnvironment} from '../constants';

import {endpoints} from './constants';
import {Endpoints} from './types';

export {Endpoints};

export function getAppEndpointsConfig(
    appEnviroment: AppEnvironment.Development | AppEnvironment.Production,
) {
    return endpoints[appEnviroment];
}
