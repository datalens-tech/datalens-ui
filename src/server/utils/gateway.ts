import type {IncomingHttpHeaders} from 'http';

import type {Request, Response} from '@gravity-ui/expresskit';
import type {Headers as DebugHeaders, GatewayConfig, GatewayError} from '@gravity-ui/gateway';
import type {AppContext, NodeKit} from '@gravity-ui/nodekit';
import {AppError} from '@gravity-ui/nodekit';

import {getAuthArgs, getAuthHeaders} from '../../shared/schema/gateway-utils';
import {IPV6_AXIOS_OPTIONS} from '../../shared/server/axios';

export type GatewayApiErrorResponse<T = GatewayError> = {
    error: T;
    debugHeaders?: DebugHeaders;
};

export const isGatewayError = (error: any): error is GatewayApiErrorResponse => {
    if (!error || typeof error !== 'object') {
        return false;
    }
    const err = error.error;
    return (
        Boolean(err) &&
        typeof err === 'object' &&
        'code' in err &&
        'message' in err &&
        'status' in err
    );
};

const UNKNOWN_TYPE = 'unknownType';
const UNKNOWN_ENV = 'unknownEnv';

export const getGatewayConfig = (
    nodekit: NodeKit,
    config?: Partial<GatewayConfig<AppContext, Request, Response>>,
): GatewayConfig<AppContext, Request, Response> => {
    const axiosConfig = nodekit.config.useIPV6 ? IPV6_AXIOS_OPTIONS : {};

    return {
        installation: nodekit.config.appInstallation || UNKNOWN_TYPE,
        env: nodekit.config.appEnv || UNKNOWN_ENV,
        proxyHeaders: (headers) => {
            const HEADERS_WITH_SENSITIVE_URLS = ['referer'];
            const preparedHeaders: IncomingHttpHeaders = {};

            const proxyHeaders = nodekit.config.gatewayProxyHeaders;

            const proxyHeadersLowerCase = proxyHeaders.map((header) => header.toLowerCase());
            const headersWithSensitiveUrlsLowerCase = HEADERS_WITH_SENSITIVE_URLS.map((header) =>
                header.toLowerCase(),
            );

            Object.keys(headers).forEach((key) => {
                const keyLowerCase = key.toLowerCase();

                if (proxyHeadersLowerCase.includes(keyLowerCase)) {
                    const value = headers[key];

                    if (
                        headersWithSensitiveUrlsLowerCase.includes(keyLowerCase) &&
                        typeof value === 'string'
                    ) {
                        preparedHeaders[key] = nodekit.utils.redactSensitiveQueryParams(value);
                    } else {
                        preparedHeaders[key] = value;
                    }
                }
            });

            return preparedHeaders;
        },
        caCertificatePath: null,
        axiosConfig,
        withDebugHeaders: false,
        getAuthArgs,
        getAuthHeaders,
        ErrorConstructor: AppError,
        ...(config || {}),
    };
};
