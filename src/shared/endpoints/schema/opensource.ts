import {endpoints} from '../constants';

export const opensourceEndpoints = {
    development: {
        bi: {
            endpoint: endpoints.development.api.bi,
            datasetDataApiEndpoint: endpoints.development.api.biData,
        },
        biConverter: {
            endpoint: endpoints.development.api.biConverter,
            csvConverter: endpoints.development.api.csvConverter,
        },
        us: {
            endpoint: endpoints.development.api.us,
        },
        transfer: {
            endpoint: endpoints.development.api.transfer,
        },
    },
    production: {
        bi: {
            endpoint: endpoints.production.api.bi,
            datasetDataApiEndpoint: endpoints.production.api.biData,
        },
        biConverter: {
            endpoint: endpoints.production.api.biConverter,
            csvConverter: endpoints.production.api.csvConverter,
        },
        us: {
            endpoint: endpoints.production.api.us,
        },
        transfer: {
            endpoint: endpoints.development.api.transfer,
        },
    },
};
