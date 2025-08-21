import type {PublicApiRpcMap} from './types';

export const PUBLIC_API_PROXY_MAP = {
    v0: {
        // navigation
        getNavigationList: {
            resolve: (api) => api.mix.getNavigationList,
            openApi: {
                summary: 'Get navigation list',
                tags: ['navigation'],
            },
        },
        getStructureItems: {
            resolve: (api) => api.us.getStructureItems,
            openApi: {
                summary: 'Get structure list',
                tags: ['navigation'],
            },
        },
        createWorkbook: {
            resolve: (api) => api.us.createWorkbook,
            openApi: {
                summary: 'Create workbook',
                tags: ['navigation'],
            },
        },
        createCollection: {
            resolve: (api) => api.us.createCollection,
            openApi: {
                summary: 'Create collection',
                tags: ['navigation'],
            },
        },
        // connection
        getConnection: {
            resolve: (api) => api.bi.getConnection,
            openApi: {
                summary: 'Get connection',
                tags: ['connection'],
            },
        },
        updateConnection: {
            resolve: (api) => api.bi.updateConnection,
            openApi: {
                summary: 'Update connection',
                tags: ['connection'],
            },
        },
        createConnection: {
            resolve: (api) => api.bi.createConnection,
            openApi: {
                summary: 'Create connection',
                tags: ['connection'],
            },
        },
        deleteConnection: {
            resolve: (api) => api.bi.deleteConnnection,
            openApi: {
                summary: 'Delete connection',
                tags: ['connection'],
            },
        },
        // dataset
        getDataset: {
            resolve: (api) => api.bi.getDatasetApi,
            openApi: {
                summary: 'Get dataset',
                tags: ['dataset'],
            },
        },
        updateDataset: {
            resolve: (api) => api.bi.updateDatasetApi,
            openApi: {
                summary: 'Update dataset',
                tags: ['dataset'],
            },
        },
        createDataset: {
            resolve: (api) => api.bi.createDatasetApi,
            openApi: {
                summary: 'Create dataset',
                tags: ['dataset'],
            },
        },
        deleteDataset: {
            resolve: (api) => api.bi.deleteDatasetApi,
            openApi: {
                summary: 'Delete dataset',
                tags: ['dataset'],
            },
        },
        // wizard
        getWizardChart: {
            resolve: (api) => api.mix.getWizardChartApi,
            openApi: {
                summary: 'Get wizard chart',
                tags: ['wizard'],
            },
        },
        updateWizardChart: {
            resolve: (api) => api.mix.updateWizardChartApi,
            openApi: {
                summary: 'Update wizard chart',
                tags: ['wizard'],
            },
        },
        createWizardChart: {
            resolve: (api) => api.mix.createWizardChartApi,
            openApi: {
                summary: 'Create wizard chart',
                tags: ['wizard'],
            },
        },
        deleteWizardChart: {
            resolve: (api) => api.mix.deleteWizardChartApi,
            openApi: {
                summary: 'Delete wizard chart',
                tags: ['wizard'],
            },
        },
        // editor
        getEditorChart: {
            resolve: (api) => api.mix.getEditorChartApi,
            openApi: {
                summary: 'Get editor chart',
                tags: ['editor'],
            },
        },
        updateEditorChart: {
            resolve: (api) => api.mix.updateEditorChart,
            openApi: {
                summary: 'Update editor chart',
                tags: ['editor'],
            },
        },
        createEditorChart: {
            resolve: (api) => api.mix.createEditorChart,
            openApi: {
                summary: 'Create editor chart',
                tags: ['editor'],
            },
        },
        deleteEditorChart: {
            resolve: (api) => api.mix.deleteEditorChartApi,
            openApi: {
                summary: 'Delete editor chart',
                tags: ['editor'],
            },
        },
        // Dash
        getDashboard: {
            resolve: (api) => api.mix.getDashboardApi,
            openApi: {
                summary: 'Get dashboard',
                tags: ['dashboard'],
            },
        },
        updateDashboard: {
            resolve: (api) => api.mix.updateDashboardApi,
            openApi: {
                summary: 'Delete dashboard',
                tags: ['dashboard'],
            },
        },
        createDashboard: {
            resolve: (api) => api.mix.createDashboardApi,
            openApi: {
                summary: 'Create dashboard',
                tags: ['dashboard'],
            },
        },
        deleteDashboard: {
            resolve: (api) => api.mix.deleteDashboardApi,
            openApi: {
                summary: 'Delete dashboard',
                tags: ['dashboard'],
            },
        },
        // Report
        // getReport: {
        //     resolve: (api) => api.bi.createDataset,
        //     openApi: {
        //         summary: 'Get report',
        //         tags: ['report'],
        //     },
        // },
        // updateReport: {
        //     resolve: (api) => api.bi.updateDataset,
        //     openApi: {
        //         summary: 'Delete report',
        //         tags: ['report'],
        //     },
        // },
        // createReport: {
        //     resolve: (api) => api.bi.createDataset,
        //     openApi: {
        //         summary: 'Create report',
        //         tags: ['report'],
        //     },
        // },
        // deleteReport: {
        //     resolve: (api) => api.bi.deleteDataset,
        //     openApi: {
        //         summary: 'Delete report',
        //         tags: ['report'],
        //     },
        // },
    },
} satisfies PublicApiRpcMap;
