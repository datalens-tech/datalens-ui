import {endpoints} from '../constants';

export const opensourceEndpoints = {
    development: {
        bi: {
            endpoint: endpoints.development.api.bi,
            datasetDataApiEndpoint: endpoints.development.api.biData,
        },
        us: {
            endpoint: endpoints.development.api.us,
        },
    },
    production: {
        bi: {
            endpoint: endpoints.production.api.bi,
            datasetDataApiEndpoint: endpoints.production.api.biData,
        },
        us: {
            endpoint: endpoints.production.api.us,
        },
    },
};
