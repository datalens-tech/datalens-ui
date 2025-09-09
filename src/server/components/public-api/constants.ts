import {OpenAPIRegistry} from '@asteasolutions/zod-to-openapi';

import type {PublicApiRpcMap} from './types';

export const publicApiOpenApiRegistry = new OpenAPIRegistry();

export const PUBLIC_API_HTTP_METHOD = 'POST';
export const PUBLIC_API_URL = '/rpc/:version/:action';
export const PUBLIC_API_ROUTE = `${PUBLIC_API_HTTP_METHOD} ${PUBLIC_API_URL}`;

enum ApiTag {
    Navigation = 'Navigation',
    Connection = 'Connection',
    Dataset = 'Dataset',
    Wizard = 'Wizard',
    Editor = 'Editor',
    Dashboard = 'Dashboard',
}

export const PUBLIC_API_PROXY_MAP = {
    v0: {
        // navigation
        getNavigationList: {
            resolve: (api) => api.mix.getNavigationList,
            openApi: {
                summary: 'Get navigation list',
                tags: [ApiTag.Navigation],
            },
        },
        // getStructureItems: {
        //     resolve: (api) => api.us.getStructureItems,
        //     openApi: {
        //         summary: 'Get structure list',
        //         tags: [ApiTag.Navigation],
        //     },
        // },
        // createWorkbook: {
        //     resolve: (api) => api.us.createWorkbook,
        //     openApi: {
        //         summary: 'Create workbook',
        //         tags: [ApiTag.Navigation],
        //     },
        // },
        // createCollection: {
        //     resolve: (api) => api.us.createCollection,
        //     openApi: {
        //         summary: 'Create collection',
        //         tags: [ApiTag.Navigation],
        //     },
        // },
        // connection
        getConnection: {
            resolve: (api) => api.bi.getConnection,
            openApi: {
                summary: 'Get connection',
                tags: [ApiTag.Connection],
            },
        },
        updateConnection: {
            resolve: (api) => api.bi.updateConnection,
            openApi: {
                summary: 'Update connection',
                tags: [ApiTag.Connection],
            },
        },
        createConnection: {
            resolve: (api) => api.bi.createConnection,
            openApi: {
                summary: 'Create connection',
                tags: [ApiTag.Connection],
            },
        },
        deleteConnection: {
            resolve: (api) => api.bi.deleteConnnection,
            openApi: {
                summary: 'Delete connection',
                tags: [ApiTag.Connection],
            },
        },
        // dataset
        getDataset: {
            resolve: (api) => api.bi.getDatasetApi,
            openApi: {
                summary: 'Get dataset',
                tags: [ApiTag.Dataset],
            },
        },
        updateDataset: {
            resolve: (api) => api.bi.updateDatasetApi,
            openApi: {
                summary: 'Update dataset',
                tags: [ApiTag.Dataset],
            },
        },
        createDataset: {
            resolve: (api) => api.bi.createDatasetApi,
            openApi: {
                summary: 'Create dataset',
                tags: [ApiTag.Dataset],
            },
        },
        deleteDataset: {
            resolve: (api) => api.bi.deleteDatasetApi,
            openApi: {
                summary: 'Delete dataset',
                tags: [ApiTag.Dataset],
            },
        },
        // wizard
        getWizardChart: {
            resolve: (api) => api.mix.getWizardChartApi,
            openApi: {
                summary: 'Get wizard chart',
                tags: [ApiTag.Wizard],
            },
        },
        updateWizardChart: {
            resolve: (api) => api.mix.updateWizardChartApi,
            openApi: {
                summary: 'Update wizard chart',
                tags: [ApiTag.Wizard],
            },
        },
        createWizardChart: {
            resolve: (api) => api.mix.createWizardChartApi,
            openApi: {
                summary: 'Create wizard chart',
                tags: [ApiTag.Wizard],
            },
        },
        deleteWizardChart: {
            resolve: (api) => api.mix.deleteWizardChartApi,
            openApi: {
                summary: 'Delete wizard chart',
                tags: [ApiTag.Wizard],
            },
        },
        // editor
        getEditorChart: {
            resolve: (api) => api.mix.getEditorChartApi,
            openApi: {
                summary: 'Get editor chart',
                tags: [ApiTag.Editor],
            },
        },
        updateEditorChart: {
            resolve: (api) => api.mix.updateEditorChart,
            openApi: {
                summary: 'Update editor chart',
                tags: [ApiTag.Editor],
            },
        },
        createEditorChart: {
            resolve: (api) => api.mix.createEditorChart,
            openApi: {
                summary: 'Create editor chart',
                tags: [ApiTag.Editor],
            },
        },
        deleteEditorChart: {
            resolve: (api) => api.mix.deleteEditorChartApi,
            openApi: {
                summary: 'Delete editor chart',
                tags: [ApiTag.Editor],
            },
        },
        // Dash
        getDashboard: {
            resolve: (api) => api.mix.getDashboardApi,
            openApi: {
                summary: 'Get dashboard',
                tags: [ApiTag.Dashboard],
            },
        },
        updateDashboard: {
            resolve: (api) => api.mix.updateDashboardApi,
            openApi: {
                summary: 'Delete dashboard',
                tags: [ApiTag.Dashboard],
            },
        },
        createDashboard: {
            resolve: (api) => api.mix.createDashboardApi,
            openApi: {
                summary: 'Create dashboard',
                tags: [ApiTag.Dashboard],
            },
        },
        deleteDashboard: {
            resolve: (api) => api.mix.deleteDashboardApi,
            openApi: {
                summary: 'Delete dashboard',
                tags: [ApiTag.Dashboard],
            },
        },
    },
} satisfies PublicApiRpcMap;
