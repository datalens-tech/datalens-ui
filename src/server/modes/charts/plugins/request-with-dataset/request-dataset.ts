import type {Request} from '@gravity-ui/expresskit';
import isNumber from 'lodash/isNumber';

import type {WorkbookId} from '../../../../../shared';
import {DL_EMBED_TOKEN_HEADER} from '../../../../../shared';
import type {GetDataSetFieldsByIdResponse, PartialDatasetField} from '../../../../../shared/schema';
import Cache from '../../../../components/cache-client';
import {getHeaders} from '../../../../components/charts-engine/controllers/charts';
import {registry} from '../../../../registry';
import type {DatalensGatewaySchemas} from '../../../../types/gateway';

import type {ConfigurableRequestWithDatasetPluginOptions} from './index';

export const DEFAULT_CACHE_TTL = 30;

const getStatusFromError = (error: unknown) =>
    typeof error === 'object' && error !== null && 'status' in error && error.status;

export const getDatasetFieldsById = async (
    datasetId: string,
    workbookId: string | null,
    req: Request,
    rejectFetchingSource: (reason?: any) => void,
    iamToken?: string,
    pluginOptions?: ConfigurableRequestWithDatasetPluginOptions,
): Promise<GetDataSetFieldsByIdResponse> => {
    const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();

    const requestDatasetFields =
        pluginOptions?.getDataSetFieldsById || gatewayApi.bi.getDataSetFieldsById;

    const requestDatasetFieldsByToken = gatewayApi.bi.embedsGetDataSetFieldsById;
    try {
        const headers = getHeaders(req);

        const response = req.headers[DL_EMBED_TOKEN_HEADER]
            ? await requestDatasetFieldsByToken({
                  ctx: req.ctx,
                  headers,
                  requestId: req.id,
                  args: {
                      dataSetId: datasetId,
                  },
              })
            : await requestDatasetFields({
                  ctx: req.ctx,
                  headers,
                  requestId: req.id,
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
            req.ctx.logError('FAILED_TO_RECEIVE_FIELDS', error);
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
    req: Request;
    iamToken?: string;
    cacheClient: Cache;
    userId: string | null;
    rejectFetchingSource: (reason: any) => void;
    pluginOptions?: ConfigurableRequestWithDatasetPluginOptions;
}): Promise<{datasetFields: PartialDatasetField[]; revisionId: string}> => {
    const {
        datasetId,
        workbookId,
        cacheClient,
        req,
        userId,
        iamToken,
        rejectFetchingSource,
        pluginOptions,
    } = args;

    const cacheKey = `${datasetId}__${userId}`;

    req.ctx.log('DATASET_FOR_CHARTS_MIDDLEWARE', {cacheKey});

    let datasetFields: PartialDatasetField[];
    let revisionId: string;

    if (cacheClient.client) {
        const cacheResponse = await cacheClient.get({key: cacheKey});

        if (cacheResponse.status === Cache.OK) {
            datasetFields = cacheResponse.data.datasetFields;
            revisionId = cacheResponse.data.revisionId;
            req.ctx.log('DATASET_FIELDS_WAS_RECEIVED_FROM_CACHE');
        } else {
            req.ctx.log('DATASET_FIELDS_IN_CACHE_WAS_NOT_FOUND');

            const response = await getDatasetFieldsById(
                datasetId,
                workbookId,
                req,
                rejectFetchingSource,
                iamToken,
                pluginOptions,
            );
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
                        req.ctx.log('SET_DATASET_IN_CACHE_SUCCESS');
                    } else {
                        req.ctx.logError(
                            'SET_DATASET_FIELDS_IN_CACHE_FAILED',
                            new Error(setCacheResponse.message),
                        );
                    }
                })
                .catch((error) => {
                    req.ctx.logError('SET_DATASET_FIELDS_UNHANDLED_ERROR', error);
                });
        }
    } else {
        const response = await getDatasetFieldsById(
            datasetId,
            workbookId,
            req,
            rejectFetchingSource,
            iamToken,
            pluginOptions,
        );
        datasetFields = response.fields;
        revisionId = response.revision_id;
    }

    req.ctx.log('DATASET_FIELDS_WAS_SUCCESSFULLY_PROCESSED');

    return {datasetFields, revisionId};
};
