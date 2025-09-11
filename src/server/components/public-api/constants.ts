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
        // getNavigationList: {
        //     resolve: (api) => api.mix.getNavigationList,
        //     openApi: {
        //         summary: 'Get navigation list',
        //         tags: [ApiTag.Navigation],
        //     },
        // },
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
        // getConnection: {
        //     resolve: (api) => api.bi.getConnection,
        //     openApi: {
        //         summary: 'Get connection',
        //         tags: [ApiTag.Connection],
        //     },
        // },
        // updateConnection: {
        //     resolve: (api) => api.bi.updateConnection,
        //     openApi: {
        //         summary: 'Update connection',
        //         tags: [ApiTag.Connection],
        //     },
        // },
        // createConnection: {
        //     resolve: (api) => api.bi.createConnection,
        //     openApi: {
        //         summary: 'Create connection',
        //         tags: [ApiTag.Connection],
        //     },
        // },
        // deleteConnection: {
        //     resolve: (api) => api.bi.deleteConnection,
        //     openApi: {
        //         summary: 'Delete connection',
        //         tags: [ApiTag.Connection],
        //     },
        // },
        // dataset
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
        // wizard
        getWizardChart: {
            resolve: (api) => api.mix.__getWizardChart__,
            openApi: {
                summary: 'Get wizard chart',
                tags: [ApiTag.Wizard],
            },
        },
        updateWizardChart: {
            resolve: (api) => api.mix.__updateWizardChart__,
            openApi: {
                summary: 'Update wizard chart',
                tags: [ApiTag.Wizard],
            },
        },
        createWizardChart: {
            resolve: (api) => api.mix.__createWizardChart__,
            openApi: {
                summary: 'Create wizard chart',
                tags: [ApiTag.Wizard],
            },
        },
        deleteWizardChart: {
            resolve: (api) => api.mix.__deleteWizardChart__,
            openApi: {
                summary: 'Delete wizard chart',
                tags: [ApiTag.Wizard],
            },
        },
        // editor
        getEditorChart: {
            resolve: (api) => api.mix.__getEditorChart__,
            openApi: {
                summary: 'Get editor chart',
                tags: [ApiTag.Editor],
            },
        },
        // updateEditorChart: {
        //     resolve: (api) => api.mix.updateEditorChart,
        //     openApi: {
        //         summary: 'Update editor chart',
        //         tags: [ApiTag.Editor],
        //     },
        // },
        // createEditorChart: {
        //     resolve: (api) => api.mix.createEditorChart,
        //     openApi: {
        //         summary: 'Create editor chart',
        //         tags: [ApiTag.Editor],
        //     },
        // },
        deleteEditorChart: {
            resolve: (api) => api.mix.__deleteEditorChart__,
            openApi: {
                summary: 'Delete editor chart',
                tags: [ApiTag.Editor],
            },
        },
        // Dash
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
