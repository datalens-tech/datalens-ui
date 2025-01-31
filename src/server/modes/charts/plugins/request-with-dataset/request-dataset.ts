import type {OutgoingHttpHeaders} from 'http';

import type {AppContext} from '@gravity-ui/nodekit';
import {REQUEST_ID_PARAM_NAME} from '@gravity-ui/nodekit';
import {isObject} from 'lodash';
import isNumber from 'lodash/isNumber';

import type {WorkbookId} from '../../../../../shared';
import {DL_EMBED_TOKEN_HEADER} from '../../../../../shared';
import type {GetDataSetFieldsByIdResponse, PartialDatasetField} from '../../../../../shared/schema';
import Cache from '../../../../components/cache-client';
import {
    type AuthParams,
    type ZitadelParams,
    addAuthHeaders,
    addZitadelHeaders,
} from '../../../../components/charts-engine/components/processor/data-fetcher';
import {registry} from '../../../../registry';
import type {DatalensGatewaySchemas} from '../../../../types/gateway';

import type {ConfigurableRequestWithDatasetPluginOptions} from './index';

export const DEFAULT_CACHE_TTL = 30;

const getStatusFromError = (error: unknown) =>
    typeof error === 'object' && error !== null && 'status' in error && error.status;

const getDatasetFieldsById = async ({
    datasetId,
    workbookId,
    ctx,
    rejectFetchingSource,
    iamToken,
    pluginOptions,
    zitadelParams,
    authParams,
    headers,
}: {
    datasetId: string;
    workbookId: string | null;
    ctx: AppContext;
    rejectFetchingSource: (reason?: any) => void;
    iamToken?: string;
    pluginOptions?: ConfigurableRequestWithDatasetPluginOptions;
    zitadelParams: ZitadelParams | undefined;
    authParams: AuthParams | undefined;
    headers: OutgoingHttpHeaders;
}): Promise<GetDataSetFieldsByIdResponse> => {
    const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();

    const requestDatasetFields =
        pluginOptions?.getDataSetFieldsById || gatewayApi.bi.getDataSetFieldsById;

    const requestDatasetFieldsByToken = gatewayApi.bi.embedsGetDataSetFieldsById;
    try {
        if (zitadelParams) {
            addZitadelHeaders({headers, zitadelParams});
        }

        if (authParams) {
            addAuthHeaders({headers, authParams});
        }

        const response = headers[DL_EMBED_TOKEN_HEADER]
            ? await requestDatasetFieldsByToken({
                  ctx,
                  headers,
                  //requestId: headers['x-request-id'] ? headers['x-request-id']: req.id,
                  requestId: ctx.get(REQUEST_ID_PARAM_NAME) || headers['x-request-id']?.toString() || '',
                  args: {
                      dataSetId: datasetId,
                  },
              })
            : await requestDatasetFields({
                  ctx: ctx,
                  headers,
                  //requestId: headers['x-request-id'] ? headers['x-request-id']: req.id,
                  requestId: ctx.get(REQUEST_ID_PARAM_NAME) || headers['x-request-id']?.toString() || '',
                  authArgs: {iamToken},
                  args: {
                      dataSetId: datasetId,
                      workbookId: workbookId,
                  },
              });

        return response.responseData;
    } catch (err: unknown) {
        if (typeof err === 'object' && err !== null && 'error' in err) {
            const {error} = err;
            let preparedError = error;
            if (isObject(error) && 'message' in error) {
                const message = error.message as string;
                preparedError = new Error(message);
            }
            ctx.logError('FAILED_TO_RECEIVE_FIELDS', preparedError);
            const status = getStatusFromError(error);
            if (isNumber(status) && status < 500) {
                rejectFetchingSource({
                    [`${datasetId}_result`]: error,
                });
            }
        }
        throw new Error('FAILED_TO_RECEIVE_DATASET_FIELDS');
    }
};

export const getDatasetFields = async (args: {
    datasetId: string;
    workbookId: WorkbookId;
    ctx: AppContext;
    iamToken?: string;
    cacheClient: Cache;
    userId: string | null;
    rejectFetchingSource: (reason: any) => void;
    pluginOptions?: ConfigurableRequestWithDatasetPluginOptions;
    zitadelParams: ZitadelParams | undefined;
    authParams: AuthParams | undefined;
    requestHeaders: OutgoingHttpHeaders;
}): Promise<{datasetFields: PartialDatasetField[]; revisionId: string}> => {
    const {
        datasetId,
        workbookId,
        cacheClient,
        ctx,
        userId,
        iamToken,
        rejectFetchingSource,
        pluginOptions,
        zitadelParams,
        authParams,
        requestHeaders,
    } = args;

    const cacheKey = `${datasetId}__${userId}`;

    ctx.log('DATASET_FOR_CHARTS_MIDDLEWARE', {cacheKey});

    let datasetFields: PartialDatasetField[];
    let revisionId: string;

    if (cacheClient.client) {
        const cacheResponse = await cacheClient.get({key: cacheKey});

        if (cacheResponse.status === Cache.OK) {
            datasetFields = cacheResponse.data.datasetFields;
            revisionId = cacheResponse.data.revisionId;
            ctx.log('DATASET_FIELDS_WAS_RECEIVED_FROM_CACHE');
        } else {
            ctx.log('DATASET_FIELDS_IN_CACHE_WAS_NOT_FOUND');

            const response = await getDatasetFieldsById({
                datasetId,
                workbookId,
                ctx,
                rejectFetchingSource,
                iamToken,
                pluginOptions,
                zitadelParams,
                authParams,
                headers: requestHeaders,
            });
            datasetFields = response.fields;
            revisionId = response.revision_id;
            cacheClient
                .set({
                    key: cacheKey,
                    ttl: pluginOptions?.cache || DEFAULT_CACHE_TTL,
                    value: {datasetFields, revisionId},
                })
                .then((setCacheResponse) => {
                    if (setCacheResponse.status === Cache.OK) {
                        ctx.log('SET_DATASET_IN_CACHE_SUCCESS');
                    } else {
                        ctx.logError(
                            'SET_DATASET_FIELDS_IN_CACHE_FAILED',
                            new Error(setCacheResponse.message),
                        );
                    }
                })
                .catch((error) => {
                    ctx.logError('SET_DATASET_FIELDS_UNHANDLED_ERROR', error);
                });
        }
    } else {
        const response = await getDatasetFieldsById({
            datasetId,
            workbookId,
            ctx,
            rejectFetchingSource,
            iamToken,
            pluginOptions,
            zitadelParams,
            authParams,
            headers: requestHeaders,
        });
        datasetFields = response.fields;
        revisionId = response.revision_id;
    }

    ctx.log('DATASET_FIELDS_WAS_SUCCESSFULLY_PROCESSED');

    return {datasetFields, revisionId};
};
