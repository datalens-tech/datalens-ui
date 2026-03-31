import {registry} from '../../../../server/registry';
import {DATASET_ID_HEADER, WORKBOOK_ID_HEADER} from '../../../constants';
import {createAction, createTypedAction} from '../../gateway-utils';
import {filterUrlFragment} from '../../utils';
import {transformConnectionResponseError} from '../helpers';
import {
    createConnectionArgsSchema,
    createConnectionResultSchema,
    deleteConnectionArgsSchema,
    deleteConnectionResultSchema,
    getConnectionArgsSchema,
    getConnectionResultSchema,
    updateConnectionArgsSchema,
    updateConnectionResultSchema,
} from '../schemas/connections';
import type {
    AddGoogleSheetArgs,
    AddGoogleSheetResponse,
    AddYandexDocumentArgs,
    AddYandexDocumentResponse,
    ApplySourceSettingsArgs,
    ApplySourceSettingsResponse,
    CreateConnectionArgs,
    CreateConnectionResponse,
    DownloadPresignedUrlArgs,
    DownloadPresignedUrlResponse,
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
    GetFileSourceStatusArgs,
    GetFileSourceStatusResponse,
    GetFileSourcesArgs,
    GetFileSourcesResponse,
    GetFileStatusArgs,
    GetFileStatusResponse,
    GetPresignedUrlResponse,
    ImportConnectionArgs,
    ImportConnectionResponse,
    ListConnectorIconsResponse,
    UpdateConnectionArgs,
    UpdateConnectionResponse,
    UpdateFileSourceArgs,
    UpdateFileSourceResponse,
    UpdateS3BasedConnectionDataArgs,
    UpdateS3BasedConnectionDataResponse,
    VerifyConnectionArgs,
    VerifyConnectionParamsArgs,
    VerifyConnectionParamsResponse,
    VerifyConnectionResponse,
} from '../types';

const PATH_PREFIX = '/api/v1';
const PATH_DATA_API_PREFIX = '/api/data/v1';
const PATH_FILE_UPLOADER_PREFIX_V2 = '/file-uploader/api/v2';

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
    getConnection: createTypedAction<GetConnectionResponse, GetConnectionArgs>(
        {
            paramsSchema: getConnectionArgsSchema,
            resultSchema: getConnectionResultSchema,
        },
        {
            method: 'GET',
            path: ({connectionId}) => `${PATH_PREFIX}/connections/${connectionId}`,
            params: ({workbookId, bindedDatasetId, rev_id}, headers) => ({
                headers: {
                    ...(workbookId ? {[WORKBOOK_ID_HEADER]: workbookId} : {}),
                    ...(bindedDatasetId ? {[DATASET_ID_HEADER]: bindedDatasetId} : {}),
                    ...headers,
                },
                query: {rev_id},
            }),
        },
    ),
    createConnection: createTypedAction<CreateConnectionResponse, CreateConnectionArgs>(
        {
            paramsSchema: createConnectionArgsSchema,
            resultSchema: createConnectionResultSchema,
        },
        {
            method: 'POST',
            path: () => `${PATH_PREFIX}/connections`,
            params: (body, headers) => ({body, headers}),
            transformResponseError: transformConnectionResponseError,
        },
    ),
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
    updateConnection: createTypedAction<UpdateConnectionResponse, UpdateConnectionArgs>(
        {
            paramsSchema: updateConnectionArgsSchema,
            resultSchema: updateConnectionResultSchema,
        },
        {
            method: 'PUT',
            path: ({connectionId}) => `${PATH_PREFIX}/connections/${connectionId}`,
            params: ({data}, headers) => ({body: data, headers}),
            transformResponseError: transformConnectionResponseError,
        },
    ),
    deleteConnection: createTypedAction(
        {
            paramsSchema: deleteConnectionArgsSchema,
            resultSchema: deleteConnectionResultSchema,
        },
        {
            method: 'DELETE',
            path: ({connectionId}) =>
                `${PATH_PREFIX}/connections/${filterUrlFragment(connectionId)}`,
            params: (_, headers) => ({headers}),
        },
    ),
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
        params: ({connectionId}, headers) => ({headers, query: {conn_id: connectionId}}),
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
            return registry.common.auth.getAll().getAuthHeadersBIPrivate(params);
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
            return registry.common.auth.getAll().getAuthHeadersBIPrivate(params);
        },
    }),
    getFileStatus: createAction<GetFileStatusResponse, GetFileStatusArgs>({
        method: 'GET',
        path: ({fileId}) => `${PATH_FILE_UPLOADER_PREFIX_V2}/files/${fileId}/status`,
        params: (_, headers) => ({headers}),
    }),
    getFileSources: createAction<GetFileSourcesResponse, GetFileSourcesArgs>({
        method: 'GET',
        path: ({fileId}) => `${PATH_FILE_UPLOADER_PREFIX_V2}/files/${fileId}/sources`,
        params: (_, headers) => ({headers}),
    }),
    getFileSourceStatus: createAction<GetFileSourceStatusResponse, GetFileSourceStatusArgs>({
        method: 'GET',
        path: ({fileId, sourceId}) =>
            `${PATH_FILE_UPLOADER_PREFIX_V2}/files/${fileId}/sources/${sourceId}/status`,
        params: (_, headers) => ({headers}),
    }),
    updateFileSource: createAction<UpdateFileSourceResponse, UpdateFileSourceArgs>({
        method: 'POST',
        path: ({fileId, sourceId}) =>
            `${PATH_FILE_UPLOADER_PREFIX_V2}/files/${fileId}/sources/${sourceId}`,
        params: ({fileId: _1, sourceId: _2, ...body}, headers) => ({body, headers}),
    }),
    applySourceSettings: createAction<ApplySourceSettingsResponse, ApplySourceSettingsArgs>({
        method: 'POST',
        path: ({fileId, sourceId}) =>
            `${PATH_FILE_UPLOADER_PREFIX_V2}/files/${fileId}/sources/${sourceId}/apply_settings`,
        params: ({fileId: _1, sourceId: _2, ...body}, headers) => ({body, headers}),
    }),
    addGoogleSheet: createAction<AddGoogleSheetResponse, AddGoogleSheetArgs>({
        method: 'POST',
        path: () => `${PATH_FILE_UPLOADER_PREFIX_V2}/links`,
        params: (body, headers) => ({body, headers}),
    }),
    updateS3BasedConnectionData: createAction<
        UpdateS3BasedConnectionDataResponse,
        UpdateS3BasedConnectionDataArgs
    >({
        method: 'POST',
        path: () => `${PATH_FILE_UPLOADER_PREFIX_V2}/update_connection_data`,
        params: (body, headers) => ({body, headers}),
    }),
    addYandexDocument: createAction<AddYandexDocumentResponse, AddYandexDocumentArgs>({
        method: 'POST',
        path: () => `${PATH_FILE_UPLOADER_PREFIX_V2}/documents`,
        params: (body, headers) => ({body, headers}),
    }),
    getPresignedUrl: createAction<GetPresignedUrlResponse>({
        method: 'GET',
        path: () => `${PATH_FILE_UPLOADER_PREFIX_V2}/make_presigned_url`,
        params: (_, headers) => ({headers}),
        transformResponseData(data, config) {
            const s3ProxyEndpoint: string = config.ctx.config.endpoints.api?.s3Proxy;
            // fix s3 endpoint with reverse proxy in k8s or docker internal service
            // more details: https://github.com/minio/minio-js/issues/514
            if (s3ProxyEndpoint) {
                return {
                    ...data,
                    url: data.url.replace(/^https?:\/\/.+?\//, `${s3ProxyEndpoint}/`),
                };
            }
            return data;
        },
    }),
    downloadPresignedUrl: createAction<DownloadPresignedUrlResponse, DownloadPresignedUrlArgs>({
        method: 'POST',
        path: () => `${PATH_FILE_UPLOADER_PREFIX_V2}/download_presigned_url`,
        params: (body, headers) => ({body, headers}),
    }),
};
