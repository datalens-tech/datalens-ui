import {createAction} from '../../gateway-utils';
import {
    AddGoogleSheetArgs,
    AddGoogleSheetResponse,
    AddYandexDocumentArgs,
    AddYandexDocumentResponse,
    ApplySourceSettingsArgs,
    ApplySourceSettingsResponse,
    GetFileSourceStatusArgs,
    GetFileSourceStatusResponse,
    GetFileSourcesArgs,
    GetFileSourcesResponse,
    GetFileStatusArgs,
    GetFileStatusResponse,
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
};
