import {TIMEOUT_60_SEC, TIMEOUT_95_SEC} from '../../../constants';
import {createAction} from '../../gateway-utils';
import {filterUrlFragment} from '../../utils';
import {
    transformApiV2DistinctsResponse,
    transformValidateDatasetFormulaResponseError,
    transformValidateDatasetResponseError,
} from '../helpers';
import {
    CheckDatasetsForPublicationArgs,
    CheckDatasetsForPublicationResponse,
    CopyDatasetArgs,
    CopyDatasetResponse,
    CreateDatasetArgs,
    CreateDatasetResponse,
    DeleteDatasetArgs,
    DeleteDatasetResponse,
    GetDataSetFieldsByIdArgs,
    GetDataSetFieldsByIdResponse,
    GetDatasetByVersionArgs,
    GetDatasetByVersionResponse,
    GetDistinctsApiV2Args,
    GetDistinctsApiV2Response,
    GetDistinctsApiV2TransformedResponse,
    GetFieldTypesResponse,
    GetPreviewArgs,
    GetPreviewResponse,
    GetSourceArgs,
    GetSourceResponse,
    UpdateDatasetArgs,
    UpdateDatasetResponse,
    ValidateDatasetArgs,
    ValidateDatasetFormulaArgs,
    ValidateDatasetFormulaResponse,
    ValidateDatasetResponse,
} from '../types';

const API_V1 = '/api/v1';
const API_DATA_V1 = '/api/data/v1';
const API_DATA_V2 = '/api/data/v2';

export const actions = {
    getSources: createAction<GetSourceResponse, GetSourceArgs>({
        method: 'GET',
        path: ({connectionId}) =>
            `${API_V1}/connections/${filterUrlFragment(connectionId)}/info/sources`,
        params: ({limit}, headers) => ({query: {limit}, headers}),
        timeout: TIMEOUT_60_SEC,
    }),
    getDatasetByVersion: createAction<GetDatasetByVersionResponse, GetDatasetByVersionArgs>({
        method: 'GET',
        path: ({datasetId, version}) =>
            `${API_V1}/datasets/${filterUrlFragment(datasetId)}/versions/${filterUrlFragment(
                version,
            )}`,
        params: (_, headers) => ({headers}),
    }),
    getFieldTypes: createAction<GetFieldTypesResponse>({
        method: 'GET',
        path: () => `${API_V1}/info/field_types`,
        params: (_, headers) => ({headers}),
    }),
    getDataSetFieldsById: createAction<GetDataSetFieldsByIdResponse, GetDataSetFieldsByIdArgs>({
        method: 'GET',
        endpoint: 'datasetDataApiEndpoint',
        path: ({dataSetId}) => `${API_DATA_V1}/datasets/${filterUrlFragment(dataSetId)}/fields`,
        params: (_, headers) => ({headers}),
    }),
    embedsGetDataSetFieldsById: createAction<
        GetDataSetFieldsByIdResponse,
        GetDataSetFieldsByIdArgs
    >({
        method: 'GET',
        endpoint: 'datasetDataEmbedsApiEndpoint',
        path: ({dataSetId}) => `${API_DATA_V1}/datasets/${filterUrlFragment(dataSetId)}/fields`,
        params: (_, headers) => ({headers}),
    }),
    publicGetDataSetFieldsById: createAction<
        GetDataSetFieldsByIdResponse,
        GetDataSetFieldsByIdArgs
    >({
        method: 'GET',
        endpoint: 'datasetDataApiEndpoint',
        path: ({dataSetId}) =>
            `/public${API_DATA_V1}/datasets/${filterUrlFragment(dataSetId)}/fields`,
        params: (_, headers, {ctx}) => ({
            headers: {
                ...headers,
                [ctx.config.headersMap.publicApiToken]: process.env.PUBLIC_API_KEY,
            },
        }),
    }),
    checkDatasetsForPublication: createAction<
        CheckDatasetsForPublicationResponse,
        CheckDatasetsForPublicationArgs
    >({
        method: 'POST',
        path: () => `${API_V1}/info/datasets_publicity_checker`,
        params: ({datasetsIds}, headers) => ({body: {datasets: datasetsIds}, headers}),
    }),
    createDataset: createAction<CreateDatasetResponse, CreateDatasetArgs>({
        method: 'POST',
        path: () => `${API_V1}/datasets`,
        params: (body, headers) => ({body, headers}),
    }),
    validateDataset: createAction<ValidateDatasetResponse, ValidateDatasetArgs>({
        method: 'POST',
        path: ({datasetId, version}) =>
            datasetId
                ? `${API_V1}/datasets/${filterUrlFragment(datasetId)}/versions/${filterUrlFragment(
                      version,
                  )}/validators/schema`
                : `${API_V1}/datasets/validators/dataset`,
        params: ({dataset, updates}, headers) => ({body: {dataset, updates}, headers}),
        transformResponseError: transformValidateDatasetResponseError,
        timeout: TIMEOUT_95_SEC,
    }),
    updateDataset: createAction<UpdateDatasetResponse, UpdateDatasetArgs>({
        method: 'PUT',
        path: ({datasetId, version}) =>
            `${API_V1}/datasets/${filterUrlFragment(datasetId)}/versions/${filterUrlFragment(
                version,
            )}`,
        params: ({dataset, multisource}, headers) => ({body: {dataset, multisource}, headers}),
    }),
    getPreview: createAction<GetPreviewResponse, GetPreviewArgs>({
        method: 'POST',
        endpoint: 'datasetDataApiEndpoint',
        path: ({datasetId, version}) =>
            datasetId
                ? `${API_DATA_V1}/datasets/${filterUrlFragment(
                      datasetId,
                  )}/versions/${filterUrlFragment(version)}/preview`
                : `${API_DATA_V1}/datasets/data/preview`,
        params: ({dataset, limit}, headers) => ({body: {dataset, limit}, headers}),
        timeout: TIMEOUT_95_SEC,
    }),
    validateDatasetFormula: createAction<
        ValidateDatasetFormulaResponse,
        ValidateDatasetFormulaArgs
    >({
        method: 'POST',
        path: ({datasetId}) =>
            datasetId
                ? `${API_V1}/datasets/${filterUrlFragment(
                      datasetId,
                  )}/versions/draft/validators/field`
                : `${API_V1}/datasets/validators/field`,
        params: ({dataset, field}, headers) => ({body: {dataset, field}, headers}),
        transformResponseError: transformValidateDatasetFormulaResponseError,
    }),
    copyDataset: createAction<CopyDatasetResponse, CopyDatasetArgs>({
        method: 'POST',
        path: ({datasetId}) => `${API_V1}/datasets/${filterUrlFragment(datasetId)}/copy`,
        params: ({new_key}, headers) => ({body: {new_key}, headers}),
    }),
    getDistinctsApiV2: createAction<
        GetDistinctsApiV2Response,
        GetDistinctsApiV2Args,
        GetDistinctsApiV2TransformedResponse
    >({
        method: 'POST',
        endpoint: 'datasetDataApiEndpoint',
        path: ({datasetId}) => `${API_DATA_V2}/datasets/${datasetId}/values/distinct`,
        params: ({datasetId: _datasetId, ...body}, headers) => ({body, headers}),
        transformResponseData: transformApiV2DistinctsResponse,
        timeout: TIMEOUT_95_SEC,
    }),
    getPublicDistinctsApiV2: createAction<
        GetDistinctsApiV2Response,
        GetDistinctsApiV2Args,
        GetDistinctsApiV2TransformedResponse
    >({
        method: 'POST',
        path: ({datasetId}) => `/public${API_DATA_V2}/datasets/${datasetId}/values/distinct`,
        params: ({datasetId: _datasetId, ...body}, headers, {ctx}) => ({
            body,
            headers: {
                ...headers,
                [ctx.config.headersMap.publicApiToken]: process.env.PUBLIC_API_KEY,
            },
        }),
        transformResponseData: transformApiV2DistinctsResponse,
        timeout: TIMEOUT_95_SEC,
    }),
    deleteDataset: createAction<DeleteDatasetResponse, DeleteDatasetArgs>({
        method: 'DELETE',
        path: ({datasetId}) => `${API_V1}/datasets/${filterUrlFragment(datasetId)}`,
        params: (_, headers) => ({headers}),
    }),
};
