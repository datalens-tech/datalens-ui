import {registry} from '../../../../server/registry';
import {WORKBOOK_ID_HEADER} from '../../../constants';
import {createAction} from '../../gateway-utils';
import {filterUrlFragment} from '../../utils';
import {transformConnectionResponseError} from '../helpers';
import type {
    CreateConnectionArgs,
    CreateConnectionResponse,
    DeleteConnectionArgs,
    DeleteConnectionResponse,
    EnsureUploadRobotArgs,
    EnsureUploadRobotResponse,
    ExportConnectionArgs,
    ExportConnectionResponse,
    GetAvailableCountersArgs,
    GetAvailableCountersResponse,
    GetConnectionArgs,
    GetConnectionResponse,
    GetConnectionSourceSchemaArgs,
    GetConnectionSourceSchemaResponse,
    GetConnectionSourcesArgs,
    GetConnectionSourcesResponse,
    GetConnectionTypedQueryDataArgs,
    GetConnectionTypedQueryDataResponse,
    GetConnectorSchemaArgs,
    GetConnectorSchemaResponse,
    GetConnectorsResponse,
    ImportConnectionArgs,
    ImportConnectionResponse,
    ListConnectorIconsResponse,
    UpdateConnectionArgs,
    UpdateConnectionResponse,
    VerifyConnectionArgs,
    VerifyConnectionParamsArgs,
    VerifyConnectionParamsResponse,
    VerifyConnectionResponse,
} from '../types';

const PATH_PREFIX = '/api/v1';
const PATH_DATA_API_PREFIX = '/api/data/v1';

export const actions = {
    ensureUploadRobot: createAction<EnsureUploadRobotResponse, EnsureUploadRobotArgs>({
        method: 'POST',
        path: ({connectionId}) =>
            `${PATH_PREFIX}/connections/${filterUrlFragment(connectionId)}/ensure_upload_robot`,
        params: (_, headers) => ({headers}),
    }),
    getAvailableCounters: createAction<GetAvailableCountersResponse, GetAvailableCountersArgs>({
        method: 'GET',
        path: ({connectionId}) =>
            `${PATH_PREFIX}/connections/${filterUrlFragment(
                connectionId,
            )}/metrica_available_counters`,
        params: (_, headers) => ({headers}),
    }),
    getConnectors: createAction<GetConnectorsResponse>({
        method: 'GET',
        path: () => `${PATH_PREFIX}/info/connectors`,
        params: (_, headers) => ({headers}),
    }),
    getConnection: createAction<GetConnectionResponse, GetConnectionArgs>({
        method: 'GET',
        path: ({connectionId}) => `${PATH_PREFIX}/connections/${connectionId}`,
        params: ({workbookId}, headers) => ({
            headers: {...(workbookId ? {[WORKBOOK_ID_HEADER]: workbookId} : {}), ...headers},
        }),
    }),
    createConnection: createAction<CreateConnectionResponse, CreateConnectionArgs>({
        method: 'POST',
        path: () => `${PATH_PREFIX}/connections`,
        params: (body, headers) => ({body, headers}),
        transformResponseError: transformConnectionResponseError,
    }),
    verifyConnection: createAction<VerifyConnectionResponse, VerifyConnectionArgs>({
        method: 'POST',
        path: ({connectionId}) => `${PATH_PREFIX}/connections/test_connection/${connectionId}`,
        params: ({connectionId: _connectionId, workbookId, ...body}, headers) => ({
            body,
            headers: {...(workbookId ? {[WORKBOOK_ID_HEADER]: workbookId} : {}), ...headers},
        }),
        transformResponseError: transformConnectionResponseError,
    }),
    verifyConnectionParams: createAction<
        VerifyConnectionParamsResponse,
        VerifyConnectionParamsArgs
    >({
        method: 'POST',
        path: () => `${PATH_PREFIX}/connections/test_connection_params`,
        params: (body, headers) => ({body, headers}),
        transformResponseError: transformConnectionResponseError,
    }),
    updateConnection: createAction<UpdateConnectionResponse, UpdateConnectionArgs>({
        method: 'PUT',
        path: ({connectionId}) => `${PATH_PREFIX}/connections/${connectionId}`,
        params: ({connectionId: _connectionId, ...body}, headers) => ({body, headers}),
        transformResponseError: transformConnectionResponseError,
    }),
    deleteConnnection: createAction<DeleteConnectionResponse, DeleteConnectionArgs>({
        method: 'DELETE',
        path: ({connectionId}) => `${PATH_PREFIX}/connections/${filterUrlFragment(connectionId)}`,
        params: (_, headers) => ({headers}),
    }),
    getConnectionSources: createAction<GetConnectionSourcesResponse, GetConnectionSourcesArgs>({
        method: 'GET',
        path: ({connectionId}) => `${PATH_PREFIX}/connections/${connectionId}/info/sources`,
        params: ({workbookId}, headers) => ({
            headers: {...(workbookId ? {[WORKBOOK_ID_HEADER]: workbookId} : {}), ...headers},
        }),
    }),
    getConnectionSourceSchema: createAction<
        GetConnectionSourceSchemaResponse,
        GetConnectionSourceSchemaArgs
    >({
        method: 'POST',
        path: ({connectionId}) => `${PATH_PREFIX}/connections/${connectionId}/info/source/schema`,
        params: ({connectionId: _connectionId, workbookId, ...body}, headers) => ({
            body: {...body},
            headers: {...(workbookId ? {[WORKBOOK_ID_HEADER]: workbookId} : {}), ...headers},
        }),
    }),
    getConnectorSchema: createAction<GetConnectorSchemaResponse, GetConnectorSchemaArgs>({
        method: 'GET',
        path: ({type, mode}) => `${PATH_PREFIX}/info/connectors/forms/${type}/${mode}`,
        params: (_, headers) => ({headers}),
    }),
    getConnectionTypedQueryData: createAction<
        GetConnectionTypedQueryDataResponse,
        GetConnectionTypedQueryDataArgs
    >({
        method: 'POST',
        endpoint: 'datasetDataApiEndpoint',
        path: ({connectionId}) => `${PATH_DATA_API_PREFIX}/connections/${connectionId}/typed_query`,
        params: ({body, workbookId}, headers) => ({
            body: {...body},
            headers: {...(workbookId ? {[WORKBOOK_ID_HEADER]: workbookId} : {}), ...headers},
        }),
    }),
    listConnectorIcons: createAction<ListConnectorIconsResponse>({
        method: 'GET',
        path: () => `${PATH_PREFIX}/info/connectors/icons`,
        params: (_, headers) => ({headers}),
    }),
    _proxyExportConnection: createAction<ExportConnectionResponse, ExportConnectionArgs>({
        method: 'GET',
        path: ({connectionId}) => `${PATH_PREFIX}/connections/export/${connectionId}`,
        params: ({workbookId}, headers) => ({
            headers: {
                ...(workbookId ? {[WORKBOOK_ID_HEADER]: workbookId} : {}),
                ...headers,
            },
        }),
        getAuthHeaders: (params) => {
            const {getAuthHeadersBiPrivate} = registry.common.auth.getAll();
            return getAuthHeadersBiPrivate(params);
        },
    }),
    _proxyImportConnection: createAction<ImportConnectionResponse, ImportConnectionArgs>({
        method: 'POST',
        path: () => `${PATH_PREFIX}/connections/import`,
        params: ({workbookId, connection}, headers) => ({
            headers: {
                ...(workbookId ? {[WORKBOOK_ID_HEADER]: workbookId} : {}),
                ...headers,
            },
            body: {
                data: {
                    workbook_id: workbookId,
                    connection,
                },
                id_mapping: {},
            },
        }),
        getAuthHeaders: (params) => {
            const {getAuthHeadersBiPrivate} = registry.common.auth.getAll();
            return getAuthHeadersBiPrivate(params);
        },
    }),
};
