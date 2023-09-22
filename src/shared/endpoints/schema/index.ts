import type {EndpointsConfig} from '@gravity-ui/gateway';
import _ from 'lodash';

import {opensourceEndpoints} from './opensource';

const endpoints = {
    opensource: opensourceEndpoints,
};

export function getServiceEndpoints(service: string) {
    const serviceEndpoints = {} as Record<string, Record<string, EndpointsConfig>>;

    for (const region in endpoints) {
        if (endpoints[region as keyof typeof endpoints]) {
            const regionEndpoints = endpoints[region as keyof typeof endpoints];

            for (const environment in regionEndpoints) {
                if (regionEndpoints[environment as keyof typeof regionEndpoints]) {
                    if (_.get(regionEndpoints, [environment, service])) {
                        _.set(
                            serviceEndpoints,
                            [region, environment],
                            _.get(regionEndpoints, [environment, service]),
                        );
                    }
                }
            }
        }
    }

    return serviceEndpoints;
}
