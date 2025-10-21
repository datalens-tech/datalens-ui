import type {DatalensGatewaySchemas} from '../../../types/gateway';
import {ApiTag} from '../constants';
import type {PublicApiVersionActions} from '../types';

export const getPublicApiActionsV0 = <
    TSchema extends {root: Pick<DatalensGatewaySchemas['root'], 'bi' | 'mix'>},
>(): PublicApiVersionActions<TSchema> => {
    return {
        // Connection
        getConnection: {
            resolve: (api) => api.bi.getConnection,
            openApi: {
                summary: 'Get connection',
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
        updateConnection: {
            resolve: (api) => api.bi.updateConnection,
            openApi: {
                summary: 'Update connection',
                tags: [ApiTag.Connection],
            },
        },
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
        createDataset: {
            resolve: (api) => api.bi.createDataset,
            openApi: {
                summary: 'Create dataset',
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
        deleteDataset: {
            resolve: (api) => api.bi.deleteDataset,
            openApi: {
                summary: 'Delete dataset',
                tags: [ApiTag.Dataset],
            },
        },
        validateDataset: {
            resolve: (api) => api.bi.validateDataset,
            openApi: {
                summary: 'Validate dataset',
                tags: [ApiTag.Dataset],
            },
        },

        // Wizard
        getWizardChart: {
            resolve: (api) => api.mix.__getWizardChart__,
            openApi: {
                summary: 'Get wizard chart',
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

        // QL
        getQLChart: {
            resolve: (api) => api.mix.__getQLChart__,
            openApi: {
                summary: 'Get QL chart',
                tags: [ApiTag.QL],
            },
        },
        deleteQLChart: {
            resolve: (api) => api.mix.__deleteQLChart__,
            openApi: {
                summary: 'Delete QL chart',
                tags: [ApiTag.QL],
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
        createDashboard: {
            resolve: (api) => api.mix.__createDashboard__,
            openApi: {
                summary: 'Create dashboard',
                tags: [ApiTag.Dashboard],
            },
        },
        updateDashboard: {
            resolve: (api) => api.mix.__updateDashboard__,
            openApi: {
                summary: 'Update dashboard',
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
    };
};
