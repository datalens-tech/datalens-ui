import type {BaseSchema} from '@gravity-ui/gateway';

import {Feature} from '../../../../shared';
import type {AnyApiServiceActionConfig, DatalensGatewaySchemas} from '../../../types/gateway';
import {ApiTag} from '../constants';
import type {PublicApiVersionActions} from '../types';

type OverrideActions<T extends BaseSchema> = {
    [K in keyof T]: Omit<T[K], 'actions'> & {
        actions: {
            [A in keyof T[K]['actions']]: AnyApiServiceActionConfig;
        };
    };
};

export const getPublicApiActionsV1 = <
    TSchema extends {
        root: OverrideActions<Pick<DatalensGatewaySchemas['root'], 'bi' | 'mix' | 'us'>>;
    },
>() => {
    return {
        // Collection
        createCollection: {
            resolve: (api) => api.us.createCollection,
            openApi: {
                summary: 'Create collection',
                tags: [ApiTag.Collection],
            },
            features: [Feature.CollectionsEnabled],
        },
        deleteCollection: {
            resolve: (api) => api.us.deleteCollection,
            openApi: {
                summary: 'Delete collection',
                tags: [ApiTag.Collection],
            },
            features: [Feature.CollectionsEnabled],
        },
        deleteCollections: {
            resolve: (api) => api.us.deleteCollections,
            openApi: {
                summary: 'Delete collections',
                tags: [ApiTag.Collection],
            },
            features: [Feature.CollectionsEnabled],
        },
        getCollectionBreadcrumbs: {
            resolve: (api) => api.us.getCollectionBreadcrumbs,
            openApi: {
                summary: 'Get collection breadcrumbs',
                tags: [ApiTag.Collection],
            },
            features: [Feature.CollectionsEnabled],
        },
        getCollection: {
            resolve: (api) => api.us.getCollection,
            openApi: {
                summary: 'Get collection',
                tags: [ApiTag.Collection],
            },
            features: [Feature.CollectionsEnabled],
        },
        getRootCollectionPermissions: {
            resolve: (api) => api.us.getRootCollectionPermissions,
            openApi: {
                summary: 'Get root collection permissions',
                tags: [ApiTag.Collection],
            },
            features: [Feature.CollectionsEnabled],
        },
        moveCollection: {
            resolve: (api) => api.us.moveCollection,
            openApi: {
                summary: 'Move collection',
                tags: [ApiTag.Collection],
            },
            features: [Feature.CollectionsEnabled],
        },
        moveCollections: {
            resolve: (api) => api.us.moveCollections,
            openApi: {
                summary: 'Move collections',
                tags: [ApiTag.Collection],
            },
            features: [Feature.CollectionsEnabled],
        },
        updateCollection: {
            resolve: (api) => api.us.updateCollection,
            openApi: {
                summary: 'Update collection',
                tags: [ApiTag.Collection],
            },
            features: [Feature.CollectionsEnabled],
        },

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

        // Dashboard
        getDashboard: {
            resolve: (api) => api.mix.getDashboardV1,
            openApi: {
                summary: 'Get dashboard',
                tags: [ApiTag.Dashboard],
                experimental: true,
            },
        },
        createDashboard: {
            resolve: (api) => api.mix.createDashboardV1,
            openApi: {
                summary: 'Create dashboard',
                tags: [ApiTag.Dashboard],
                experimental: true,
            },
        },
        updateDashboard: {
            resolve: (api) => api.mix.updateDashboardV1,
            openApi: {
                summary: 'Update dashboard',
                tags: [ApiTag.Dashboard],
                experimental: true,
            },
        },
        deleteDashboard: {
            resolve: (api) => api.mix.deleteDashboard,
            openApi: {
                summary: 'Delete dashboard',
                tags: [ApiTag.Dashboard],
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

        // Entries
        getEntriesRelations: {
            resolve: (api) => api.us.getEntriesRelations,
            openApi: {
                summary: 'Get entries relations',
                tags: [ApiTag.Entries],
            },
        },

        // Navigation
        getEntries: {
            resolve: (api) => api.us.getEntries,
            openApi: {
                summary: 'Get entries',
                tags: [ApiTag.Navigation],
            },
        },

        // QL
        getQLChart: {
            resolve: (api) => api.mix.__getQLChart__,
            openApi: {
                summary: 'Get QL chart',
                tags: [ApiTag.QL],
                experimental: true,
            },
        },
        deleteQLChart: {
            resolve: (api) => api.mix.deleteQLChart,
            openApi: {
                summary: 'Delete QL chart',
                tags: [ApiTag.QL],
            },
        },
        updateQLChart: {
            resolve: (api) => api.mix.__updateQLChart__,
            openApi: {
                summary: 'Update QL chart',
                tags: [ApiTag.QL],
                experimental: true,
            },
            rawAction: true,
        },
        createQLChart: {
            resolve: (api) => api.mix.__createQLChart__,
            openApi: {
                summary: 'Create QL chart',
                tags: [ApiTag.QL],
                experimental: true,
            },
            rawAction: true,
        },

        // Wizard
        getWizardChart: {
            resolve: (api) => api.mix.__getWizardChart__,
            openApi: {
                summary: 'Get wizard chart',
                tags: [ApiTag.Wizard],
                experimental: true,
            },
        },
        deleteWizardChart: {
            resolve: (api) => api.mix.deleteWizardChart,
            openApi: {
                summary: 'Delete wizard chart',
                tags: [ApiTag.Wizard],
            },
        },
        updateWizardChart: {
            resolve: (api) => api.mix.__updateWizardChart__,
            openApi: {
                summary: 'Update wizard chart',
                tags: [ApiTag.Wizard],
                experimental: true,
            },
            rawAction: true,
        },
        createWizardChart: {
            resolve: (api) => api.mix.__createWizardChart__,
            openApi: {
                summary: 'Create wizard chart',
                tags: [ApiTag.Wizard],
                experimental: true,
            },
            rawAction: true,
        },

        // Workbook
        createWorkbook: {
            resolve: (api) => api.us.createWorkbook,
            openApi: {
                summary: 'Create workbook',
                tags: [ApiTag.Workbook],
            },
            features: [Feature.CollectionsEnabled],
        },
        deleteWorkbook: {
            resolve: (api) => api.us.deleteWorkbook,
            openApi: {
                summary: 'Delete workbook',
                tags: [ApiTag.Workbook],
            },
            features: [Feature.CollectionsEnabled],
        },
        deleteWorkbooks: {
            resolve: (api) => api.us.deleteWorkbooks,
            openApi: {
                summary: 'Delete workbooks',
                tags: [ApiTag.Workbook],
            },
            features: [Feature.CollectionsEnabled],
        },
        getWorkbook: {
            resolve: (api) => api.us.getWorkbook,
            openApi: {
                summary: 'Get workbook',
                tags: [ApiTag.Workbook],
            },
            features: [Feature.CollectionsEnabled],
        },
        getWorkbooksList: {
            resolve: (api) => api.us.getWorkbooksList,
            openApi: {
                summary: 'Get workbooks list',
                tags: [ApiTag.Workbook],
            },
            features: [Feature.CollectionsEnabled],
        },
        moveWorkbook: {
            resolve: (api) => api.us.moveWorkbook,
            openApi: {
                summary: 'Move workbook',
                tags: [ApiTag.Workbook],
            },
            features: [Feature.CollectionsEnabled],
        },
        moveWorkbooks: {
            resolve: (api) => api.us.moveWorkbooks,
            openApi: {
                summary: 'Move workbooks',
                tags: [ApiTag.Workbook],
            },
            features: [Feature.CollectionsEnabled],
        },
        updateWorkbook: {
            resolve: (api) => api.us.updateWorkbook,
            openApi: {
                summary: 'Update workbook',
                tags: [ApiTag.Workbook],
            },
            features: [Feature.CollectionsEnabled],
        },
    } satisfies PublicApiVersionActions<TSchema, Feature>;
};
