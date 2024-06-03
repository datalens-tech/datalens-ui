import {endpoints} from '../constants';

import type {SourceDeclaration} from './types';

const CONNECTIONS_PATH = '/api/data/v1/connections';
const DATASETS_PATH = '/api/data/v2/datasets';

export const opensourceSources: SourceDeclaration = {
    development: {
        bi: endpoints.development.api.biData,
        bi_connections: endpoints.development.api.biData + CONNECTIONS_PATH,
        bi_datasets: endpoints.development.api.biData + DATASETS_PATH,
        us: endpoints.development.api.us,
    },
    production: {
        bi: endpoints.production.api.biData,
        bi_connections: endpoints.production.api.biData + CONNECTIONS_PATH,
        bi_datasets: endpoints.production.api.biData + DATASETS_PATH,
        us: endpoints.production.api.us,
    },
};
