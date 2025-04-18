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
        auth: {
            endpoint: endpoints.development.api.auth,
        },
        metaManager: {
            endpoint: endpoints.development.api.metaManager,
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
        auth: {
            endpoint: endpoints.production.api.auth,
        },
        metaManager: {
            endpoint: endpoints.production.api.metaManager,
        },
    },
};
