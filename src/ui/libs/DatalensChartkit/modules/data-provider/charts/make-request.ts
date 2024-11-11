import type {AxiosError, AxiosRequestConfig} from 'axios';
import axios from 'axios';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';
import pick from 'lodash/pick';
import type {DashChartRequestContext, StringParams} from 'shared';
import {
    DL_COMPONENT_HEADER,
    DlComponentHeader,
    Feature,
    REQUEST_ID_HEADER,
    TRACE_ID_HEADER,
} from 'shared';
import {axiosInstance} from 'ui/libs';
import Utils from 'ui/utils';

import DatalensChartkitCustomError, {
    ERROR_CODE,
} from '../../datalens-chartkit-custom-error/datalens-chartkit-custom-error';

import type {
    ResponseError,
    ResponseSuccess,
    ResponseSuccessControls,
    ResponseSuccessNodeBase,
} from './types';

import {CHARTS_ERROR_CODE, ChartsDataProvider} from '.';

export type RequestDecorator = (
    config: Pick<AxiosRequestConfig, 'headers' | 'data'>,
) => Pick<AxiosRequestConfig, 'headers' | 'data'>;

type MakeChartRequestArgs = {
    requestOptions: any;
    includeLogs?: boolean;
    includeUnresolvedParams?: boolean;
    isEditMode?: boolean;
    requestId?: string;
    params?: StringParams;
    requestDecorator?: RequestDecorator;
    contextHeaders?: DashChartRequestContext;
};

function getLoadHeaders(requestId: string, contextHeaders?: DashChartRequestContext) {
    const headers: Record<string, string | null> = {
        ...(contextHeaders ?? {}),
        [REQUEST_ID_HEADER]: requestId,
    };
    if (Utils.isEnabledFeature(Feature.UseComponentHeader)) {
        headers[DL_COMPONENT_HEADER] = DlComponentHeader.UI;
    }

    return headers;
}

export function prepareChartRequestConfig(
    config: AxiosRequestConfig,
    requestDecorator?: RequestDecorator,
) {
    if (requestDecorator) {
        const {headers, data} = requestDecorator(
            Object.assign({headers: {}, data: {}}, pick(config, ['headers', 'data'])),
        );
        config.headers = headers;
        config.data = data;
    }
    return config;
}

export async function makeChartRequest<T extends ResponseSuccess | ResponseSuccessControls>(
    args: MakeChartRequestArgs,
) {
    const {
        includeLogs,
        includeUnresolvedParams,
        requestId,
        params,
        isEditMode,
        requestOptions,
        requestDecorator,
        contextHeaders,
    } = args;

    try {
        const requestConfig = prepareChartRequestConfig(
            {
                ...requestOptions,
                headers: {
                    ...getLoadHeaders(requestId ?? '', contextHeaders),
                    ...requestOptions?.headers,
                },
            },
            requestDecorator,
        );

        const result = await axiosInstance(requestConfig);
        const responseData: T = result.data;
        const headers = result.headers;

        // TODO: return output when receiving onLoad
        if (includeLogs && 'logs_v2' in responseData) {
            // Wizard configs don't have logs_v2
            // TODO: it's not possible to separate the configs from the Node configs above in the Wizard condition
            ChartsDataProvider.printLogs((responseData as ResponseSuccessNodeBase).logs_v2);
        }

        if (headers[REQUEST_ID_HEADER]) {
            responseData.requestId = headers[REQUEST_ID_HEADER];
        }

        if (headers[TRACE_ID_HEADER]) {
            responseData.traceId = headers[TRACE_ID_HEADER];
        }

        if (includeUnresolvedParams) {
            responseData.unresolvedParams = cloneDeep(params);
        }

        return responseData;
    } catch (error) {
        if (axios.isCancel(error)) {
            return null;
        }

        const debug = {requestId};

        if (!error.response) {
            throw DatalensChartkitCustomError.wrap(error, {code: ERROR_CODE.NETWORK, debug});
        }

        const {
            response: {status, data},
        }: AxiosError<ResponseError> = error;

        if (includeLogs) {
            ChartsDataProvider.printLogs(data.logs_v2);
        }

        if (status === 489) {
            throw DatalensChartkitCustomError.wrap(error, {
                code: ERROR_CODE.UNAUTHORIZED,
                debug,
            });
        }

        const extra = {logs_v2: data.logs_v2, sources: data.sources, params: data.params};

        if (data.error) {
            throw DatalensChartkitCustomError.wrap(
                error,
                ChartsDataProvider.formatError(merge({debug, extra}, data.error), isEditMode),
            );
        }

        // error loading data in Wizard
        // @ts-ignore
        if (data.errorType === 'wizard_data_fetching_error') {
            throw DatalensChartkitCustomError.wrap(
                error,
                ChartsDataProvider.formatError(
                    {
                        code: CHARTS_ERROR_CODE.DATA_FETCHING_ERROR,
                        // @ts-ignore
                        details: {sources: data.sources},
                        debug,
                        extra,
                    },
                    isEditMode,
                ),
            );
        }

        throw DatalensChartkitCustomError.wrap(error, {debug, extra});
    }
}
