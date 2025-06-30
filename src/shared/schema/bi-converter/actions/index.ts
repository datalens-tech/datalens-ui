import {createAction} from '../../gateway-utils';
import type {
    AddGoogleSheetArgs,
    AddGoogleSheetResponse,
    AddYandexDocumentArgs,
    AddYandexDocumentResponse,
    ApplySourceSettingsArgs,
    ApplySourceSettingsResponse,
    DownloadPresignedUrlArgs,
    DownloadPresignedUrlResponse,
    GetFileSourceStatusArgs,
    GetFileSourceStatusResponse,
    GetFileSourcesArgs,
    GetFileSourcesResponse,
    GetFileStatusArgs,
    GetFileStatusResponse,
    GetPresignedUrlResponse,
    UpdateFileSourceArgs,
    UpdateFileSourceResponse,
    UpdateS3BasedConnectionDataArgs,
    UpdateS3BasedConnectionDataResponse,
} from '../types';

const PATH_PREFIX_V2 = '/api/v2';

export const actions = {
    getFileStatus: createAction<GetFileStatusResponse, GetFileStatusArgs>({
        method: 'GET',
        path: ({fileId}) => `${PATH_PREFIX_V2}/files/${fileId}/status`,
        params: (_, headers) => ({headers}),
    }),
    getFileSources: createAction<GetFileSourcesResponse, GetFileSourcesArgs>({
        method: 'GET',
        path: ({fileId}) => `${PATH_PREFIX_V2}/files/${fileId}/sources`,
        params: (_, headers) => ({headers}),
    }),
    getFileSourceStatus: createAction<GetFileSourceStatusResponse, GetFileSourceStatusArgs>({
        method: 'GET',
        path: ({fileId, sourceId}) =>
            `${PATH_PREFIX_V2}/files/${fileId}/sources/${sourceId}/status`,
        params: (_, headers) => ({headers}),
    }),
    updateFileSource: createAction<UpdateFileSourceResponse, UpdateFileSourceArgs>({
        method: 'POST',
        path: ({fileId, sourceId}) => `${PATH_PREFIX_V2}/files/${fileId}/sources/${sourceId}`,
        params: ({fileId: _1, sourceId: _2, ...body}, headers) => ({body, headers}),
    }),
    applySourceSettings: createAction<ApplySourceSettingsResponse, ApplySourceSettingsArgs>({
        method: 'POST',
        path: ({fileId, sourceId}) =>
            `${PATH_PREFIX_V2}/files/${fileId}/sources/${sourceId}/apply_settings`,
        params: ({fileId: _1, sourceId: _2, ...body}, headers) => ({body, headers}),
    }),
    addGoogleSheet: createAction<AddGoogleSheetResponse, AddGoogleSheetArgs>({
        method: 'POST',
        path: () => `${PATH_PREFIX_V2}/links`,
        params: (body, headers) => ({body, headers}),
    }),
    updateS3BasedConnectionData: createAction<
        UpdateS3BasedConnectionDataResponse,
        UpdateS3BasedConnectionDataArgs
    >({
        method: 'POST',
        path: () => `${PATH_PREFIX_V2}/update_connection_data`,
        params: (body, headers) => ({body, headers}),
    }),
    addYandexDocument: createAction<AddYandexDocumentResponse, AddYandexDocumentArgs>({
        method: 'POST',
        path: () => `${PATH_PREFIX_V2}/documents`,
        params: (body, headers) => ({body, headers}),
    }),
    getPresignedUrl: createAction<GetPresignedUrlResponse>({
        method: 'GET',
        path: () => `${PATH_PREFIX_V2}/make_presigned_url`,
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
        path: () => `${PATH_PREFIX_V2}/download_presigned_url`,
        params: (body, headers) => ({body, headers}),
    }),
};
