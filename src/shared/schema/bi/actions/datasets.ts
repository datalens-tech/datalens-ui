import z from 'zod/v4';

import {
    TIMEOUT_60_SEC,
    TIMEOUT_95_SEC,
    US_MASTER_TOKEN_HEADER,
    WORKBOOK_ID_HEADER,
} from '../../../constants';
import {
    datasetBodySchema,
    datasetOptionsSchema,
    datasetSchema,
} from '../../../sdk/zod-shemas/dataset-api.schema';
import {createAction, createTypedAction} from '../../gateway-utils';
import {filterUrlFragment} from '../../utils';
import {
    prepareDatasetProperty,
    transformApiV2DistinctsResponse,
    transformValidateDatasetFormulaResponseError,
    transformValidateDatasetResponseError,
} from '../helpers';
import type {
    CheckConnectionsForPublicationArgs,
    CheckConnectionsForPublicationResponse,
    CheckDatasetsForPublicationArgs,
    CheckDatasetsForPublicationResponse,
    CopyDatasetArgs,
    CopyDatasetResponse,
    CreateDatasetArgs,
    CreateDatasetResponse,
    DeleteDatasetArgs,
    DeleteDatasetResponse,
    ExportDatasetArgs,
    ExportDatasetResponse,
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
    ImportDatasetArgs,
    ImportDatasetResponse,
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

const createDatasetDefaultArgsSchema = z.object({
    name: z.string(),
    created_via: z.string().optional(),
    multisource: z.boolean(),
    dataset: datasetBodySchema,
});

const createDatasetArgsSchema = z.union([
    z.object({...createDatasetDefaultArgsSchema.shape, dir_path: z.string()}),
    z.object({...createDatasetDefaultArgsSchema.shape, workbook_id: z.string()}),
]);

export const actions = {
    getSources: createAction<GetSourceResponse, GetSourceArgs>({
        method: 'GET',
        path: ({connectionId}) =>
            `${API_V1}/connections/${filterUrlFragment(connectionId)}/info/sources`,
        params: ({limit, workbookId}, headers) => ({
            query: {limit},
            headers: {...(workbookId ? {[WORKBOOK_ID_HEADER]: workbookId} : {}), ...headers},
        }),
        timeout: TIMEOUT_60_SEC,
    }),
    getDatasetByVersion: createAction<GetDatasetByVersionResponse, GetDatasetByVersionArgs>({
        method: 'GET',
        path: ({datasetId, version}) =>
            `${API_V1}/datasets/${filterUrlFragment(datasetId)}/versions/${filterUrlFragment(
                version,
            )}`,
        params: ({workbookId, rev_id}, headers) => ({
            headers: {...(workbookId ? {[WORKBOOK_ID_HEADER]: workbookId} : {}), ...headers},
            query: {rev_id},
        }),
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
        params: ({workbookId}, headers) => ({
            headers: {...(workbookId ? {[WORKBOOK_ID_HEADER]: workbookId} : {}), ...headers},
        }),
    }),
    embedsGetDataSetFieldsById: createAction<
        GetDataSetFieldsByIdResponse,
        Omit<GetDataSetFieldsByIdArgs, 'workbookId'>
    >({
        method: 'GET',
        endpoint: 'datasetDataEmbedsApiEndpoint',
        path: ({dataSetId}) => `${API_DATA_V1}/datasets/${filterUrlFragment(dataSetId)}/fields`,
        params: (_, headers) => ({headers}),
    }),
    publicGetDataSetFieldsById: createAction<
        GetDataSetFieldsByIdResponse,
        Omit<GetDataSetFieldsByIdArgs, 'workbookId'>
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
        params: ({datasetsIds, workbookId}, headers) => ({
            body: {datasets: datasetsIds},
            headers: {...(workbookId ? {[WORKBOOK_ID_HEADER]: workbookId} : {}), ...headers},
        }),
    }),
    checkConnectionsForPublication: createAction<
        CheckConnectionsForPublicationResponse,
        CheckConnectionsForPublicationArgs
    >({
        method: 'POST',
        path: () => `${API_V1}/info/connections_publicity_checker`,
        params: ({connectionsIds, workbookId}, headers) => ({
            body: {connections: connectionsIds},
            headers: {...(workbookId ? {[WORKBOOK_ID_HEADER]: workbookId} : {}), ...headers},
        }),
    }),
    createDataset: createAction<CreateDatasetResponse, CreateDatasetArgs>({
        method: 'POST',
        path: () => `${API_V1}/datasets`,
        params: ({dataset, ...restBody}, headers, {ctx}) => {
            const resultDataset = prepareDatasetProperty(ctx, dataset);
            return {body: {...restBody, dataset: resultDataset}, headers};
        },
    }),
    validateDataset: createAction<ValidateDatasetResponse, ValidateDatasetArgs>({
        method: 'POST',
        path: ({datasetId, version}) =>
            datasetId
                ? `${API_V1}/datasets/${filterUrlFragment(datasetId)}/versions/${filterUrlFragment(
                      version,
                  )}/validators/schema`
                : `${API_V1}/datasets/validators/dataset`,
        params: ({dataset, workbookId, updates}, headers, {ctx}) => {
            const resultDataset = prepareDatasetProperty(ctx, dataset);
            return {
                body: {dataset: resultDataset, updates},
                headers: {...(workbookId ? {[WORKBOOK_ID_HEADER]: workbookId} : {}), ...headers},
            };
        },
        transformResponseError: transformValidateDatasetResponseError,
        timeout: TIMEOUT_95_SEC,
    }),
    updateDataset: createAction<UpdateDatasetResponse, UpdateDatasetArgs>({
        method: 'PUT',
        path: ({datasetId, version}) =>
            `${API_V1}/datasets/${filterUrlFragment(datasetId)}/versions/${filterUrlFragment(
                version,
            )}`,
        params: ({dataset, multisource}, headers, {ctx}) => {
            const resultDataset = prepareDatasetProperty(ctx, dataset);
            return {body: {dataset: resultDataset, multisource}, headers};
        },
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
        params: ({dataset, workbookId, limit}, headers, {ctx}) => {
            const resultDataset = prepareDatasetProperty(ctx, dataset);
            return {
                body: {dataset: resultDataset, limit},
                headers: {...(workbookId ? {[WORKBOOK_ID_HEADER]: workbookId} : {}), ...headers},
            };
        },
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
        params: ({dataset, workbookId, field}, headers, {ctx}) => {
            const resultDataset = prepareDatasetProperty(ctx, dataset);
            return {
                body: {dataset: resultDataset, field},
                headers: {...(workbookId ? {[WORKBOOK_ID_HEADER]: workbookId} : {}), ...headers},
            };
        },
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
        params: ({datasetId: _datasetId, workbookId, ...body}, headers) => ({
            body,
            headers: {
                ...(workbookId ? {[WORKBOOK_ID_HEADER]: workbookId} : {}),
                ...headers,
            },
        }),
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
    createDatasetApi: createTypedAction(
        {
            bodySchema: z.object({
                id: z.string(),
                dataset: datasetBodySchema,
                options: datasetOptionsSchema,
            }),
            argsSchema: createDatasetArgsSchema,
        },
        {
            method: 'POST',
            path: () => `${API_V1}/datasets`,
            params: ({dataset, ...restBody}, headers, {ctx}) => {
                const resultDataset = prepareDatasetProperty(ctx, dataset);
                return {body: {...restBody, dataset: resultDataset}, headers};
            },
        },
    ),
    updateDatasetApi: createTypedAction(
        {
            bodySchema: z.object({
                id: z.string(),
                dataset: datasetBodySchema,
                options: datasetOptionsSchema,
            }),
            argsSchema: z.object({
                version: z.literal('draft'),
                datasetId: z.string(),
                multisource: z.boolean(),
                dataset: datasetBodySchema,
            }),
        },
        {
            method: 'PUT',
            path: ({datasetId, version}) =>
                `${API_V1}/datasets/${filterUrlFragment(datasetId)}/versions/${filterUrlFragment(
                    version,
                )}`,
            params: ({dataset, multisource}, headers, {ctx}) => {
                const resultDataset = prepareDatasetProperty(ctx, dataset);
                return {body: {dataset: resultDataset, multisource}, headers};
            },
        },
    ),
    deleteDatasetApi: createTypedAction(
        {
            bodySchema: z.unknown(),
            argsSchema: z.object({
                datasetId: z.string(),
            }),
        },
        {
            method: 'DELETE',
            path: ({datasetId}) => `${API_V1}/datasets/${filterUrlFragment(datasetId)}`,
            params: (_, headers) => ({headers}),
        },
    ),
    getDatasetApi: createTypedAction(
        {
            bodySchema: datasetSchema,
            argsSchema: z.object({
                datasetId: z.string(),
                version: z.literal('draft'),
                workbookId: z.union([z.null(), z.string()]),
            }),
        },
        {
            method: 'GET',
            path: ({datasetId, version}) =>
                `${API_V1}/datasets/${filterUrlFragment(datasetId)}/versions/${filterUrlFragment(
                    version,
                )}`,
            params: ({workbookId}, headers) => ({
                headers: {...(workbookId ? {[WORKBOOK_ID_HEADER]: workbookId} : {}), ...headers},
            }),
        },
    ),
    _proxyExportDataset: createAction<ExportDatasetResponse, ExportDatasetArgs>({
        method: 'POST',
        path: ({datasetId}) => `${API_V1}/datasets/export/${datasetId}`,
        params: ({usMasterToken, workbookId, idMapping}, headers) => ({
            headers: {
                ...(workbookId ? {[WORKBOOK_ID_HEADER]: workbookId} : {}),
                ...headers,
                [US_MASTER_TOKEN_HEADER]: usMasterToken,
            },
            body: {
                id_mapping: idMapping,
            },
        }),
    }),
    _proxyImportDataset: createAction<ImportDatasetResponse, ImportDatasetArgs>({
        method: 'POST',
        path: () => `${API_V1}/datasets/import`,
        params: ({usMasterToken, workbookId, idMapping, dataset}, headers) => ({
            headers: {
                ...(workbookId ? {[WORKBOOK_ID_HEADER]: workbookId} : {}),
                ...headers,
                [US_MASTER_TOKEN_HEADER]: usMasterToken,
            },
            body: {
                data: {
                    workbook_id: workbookId,
                    dataset,
                },
                id_mapping: idMapping,
            },
        }),
    }),
};
