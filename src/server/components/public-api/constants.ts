import {OpenAPIRegistry} from '@asteasolutions/zod-to-openapi';

import type {PublicApiRpcMap} from './types';

export const publicApiOpenApiRegistry = new OpenAPIRegistry();

export const PUBLIC_API_HTTP_METHOD = 'POST';
export const PUBLIC_API_URL = '/rpc/:version/:action';
export const PUBLIC_API_ROUTE = `${PUBLIC_API_HTTP_METHOD} ${PUBLIC_API_URL}`;

enum ApiTag {
    Connection = 'Connection',
    Dataset = 'Dataset',
    Wizard = 'Wizard',
    Editor = 'Editor',
    Dashboard = 'Dashboard',
}

export const PUBLIC_API_PROXY_MAP = {
    v0: {
        // Connection
        deleteConnection: {
            resolve: (api) => api.bi.deleteConnection,
            openApi: {
                summary: 'Delete connection',
                tags: [ApiTag.Connection],
            },
        },

        // Dataset
        getDataset: {
            resolve: (api) => api.bi.getDatasetByVersion,
            openApi: {
                summary: 'Get dataset',
                tags: [ApiTag.Dataset],
            },
        },
        updateDataset: {
            resolve: (api) => api.bi.updateDataset,
            openApi: {
                summary: 'Update dataset',
                tags: [ApiTag.Dataset],
            },
        },
        createDataset: {
            resolve: (api) => api.bi.createDataset,
            openApi: {
                summary: 'Create dataset',
                tags: [ApiTag.Dataset],
            },
        },
        deleteDataset: {
            resolve: (api) => api.bi.deleteDataset,
            openApi: {
                summary: 'Delete dataset',
                tags: [ApiTag.Dataset],
            },
        },

        // Wizard
        deleteWizardChart: {
            resolve: (api) => api.mix.__deleteWizardChart__,
            openApi: {
                summary: 'Delete wizard chart',
                tags: [ApiTag.Wizard],
            },
        },

        // Editor
        deleteEditorChart: {
            resolve: (api) => api.mix.__deleteEditorChart__,
            openApi: {
                summary: 'Delete editor chart',
                tags: [ApiTag.Editor],
            },
        },

        // Dashboard
        getDashboard: {
            resolve: (api) => api.mix.__getDashboard__,
            openApi: {
                summary: 'Get dashboard',
                tags: [ApiTag.Dashboard],
            },
        },
        updateDashboard: {
            resolve: (api) => api.mix.__updateDashboard__,
            openApi: {
                summary: 'Delete dashboard',
                tags: [ApiTag.Dashboard],
            },
        },
        createDashboard: {
            resolve: (api) => api.mix.__createDashboard__,
            openApi: {
                summary: 'Create dashboard',
                tags: [ApiTag.Dashboard],
            },
        },
        deleteDashboard: {
            resolve: (api) => api.mix.__deleteDashboard__,
            openApi: {
                summary: 'Delete dashboard',
                tags: [ApiTag.Dashboard],
            },
        },
    },
} satisfies PublicApiRpcMap;
