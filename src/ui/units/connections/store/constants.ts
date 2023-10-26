import {DL} from 'ui';

import {ConnectionsReduxState} from './typings';

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
    validationErrors: [],
    ui: {
        checkLoading: false,
        pageLoading: false,
        schemaLoading: false,
        submitLoading: false,
    },
    apiErrors: {
        connectors: undefined,
        connection: undefined,
        entry: undefined,
        schema: undefined,
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
