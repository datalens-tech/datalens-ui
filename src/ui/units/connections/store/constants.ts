import {DL} from 'ui';

import {ConnectionsReduxState} from './typings';

export enum SelectItemsKey {
    Counters = 'counters',
    MdbClusters = 'mdbClusters',
    MdbHosts = 'mdbHosts',
    MdbUsers = 'mdbUsers',
    MdbDatabases = 'mdbDatabases',
    ServiceAccounts = 'serviceAccounts',
    YdbDatabases = 'ydbDatabases',
}

export const initialState: ConnectionsReduxState = {
    currentTenantId: DL.CURRENT_TENANT_ID,
    flattenConnectors: [],
    groupedConnectors: {result: [], sections: [], uncategorized: []},
    form: {},
    initialForm: {},
    innerForm: {},
    connectionData: {},
    // TODO: replace with general store [CHARTS-5030]
    cachedHtml: {},
    checkData: {
        status: 'unknown',
    },
    cloudTree: [],
    validationErrors: [],
    selectItems: {
        [SelectItemsKey.Counters]: [],
        [SelectItemsKey.MdbClusters]: [],
        [SelectItemsKey.MdbHosts]: [],
        [SelectItemsKey.MdbUsers]: [],
        [SelectItemsKey.MdbDatabases]: [],
        [SelectItemsKey.ServiceAccounts]: [],
        [SelectItemsKey.YdbDatabases]: [],
    },
    ui: {
        checkLoading: false,
        cloudTreeLoading: false,
        pageLoading: false,
        schemaLoading: false,
        submitLoading: false,
        itemsLoading: {
            [SelectItemsKey.Counters]: false,
            [SelectItemsKey.MdbClusters]: false,
            [SelectItemsKey.MdbHosts]: false,
            [SelectItemsKey.MdbUsers]: false,
            [SelectItemsKey.MdbDatabases]: false,
            [SelectItemsKey.ServiceAccounts]: false,
            [SelectItemsKey.YdbDatabases]: false,
        },
    },
    apiErrors: {
        connectors: undefined,
        connection: undefined,
        entry: undefined,
        schema: undefined,
        [SelectItemsKey.Counters]: undefined,
        [SelectItemsKey.MdbClusters]: undefined,
        [SelectItemsKey.MdbHosts]: undefined,
        [SelectItemsKey.MdbUsers]: undefined,
        [SelectItemsKey.MdbDatabases]: undefined,
    },
    file: {
        uploadedFiles: [],
        sources: [],
        replaceSources: [],
        columnFilter: '',
        selectedItemId: '',
        beingDeletedSourceId: undefined,
        replaceSourceActionData: {
            replaceSourceId: '',
            showFileSelection: false,
        },
    },
    gsheet: {
        items: [],
        columnFilter: '',
        selectedItemId: '',
        addSectionState: {
            url: '',
            active: false,
            disabled: false,
            uploading: false,
        },
        activeDialog: undefined,
    },
    entry: undefined,
    schema: undefined,
};
