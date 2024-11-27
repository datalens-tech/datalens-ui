import {DEFAULT_PROXY_HEADERS} from '@gravity-ui/gateway/build/constants';
import type {AppConfig} from '@gravity-ui/nodekit';

import {
    AuthHeader,
    CSRF_TOKEN_HEADER,
    DL_COMPONENT_HEADER,
    DL_EMBED_TOKEN_HEADER,
    PROJECT_ID_HEADER,
    SERVICE_USER_ACCESS_TOKEN_HEADER,
    SuperuserHeader,
    TENANT_ID_HEADER,
} from '../../shared';
import {SERVICE_NAME_DATALENS} from '../components';

export default {
    appName: `datalens-${process.env.APP_MODE}`,
    appSocket: 'dist/run/server.sock',
    expressBodyParserJSONConfig: {
        limit: '50mb',
    },
    expressBodyParserURLEncodedConfig: {
        limit: '50mb',
        extended: false,
    },
    expressTrustProxyNumber: 2,
    workers: (process.env.WORKERS && parseInt(process.env.WORKERS)) || 1,
    fetchingTimeout: 95 * 1000,
    singleFetchingTimeout: 95 * 1000,
    faviconUrl: '/favicon.ico',
    appMode: process.env.APP_MODE,
    serviceName: SERVICE_NAME_DATALENS,
    gatewayProxyHeaders: [
        ...DEFAULT_PROXY_HEADERS,
        PROJECT_ID_HEADER,
        TENANT_ID_HEADER,
        SuperuserHeader.XDlAllowSuperuser,
        SuperuserHeader.XDlSudo,
        AuthHeader.Authorization,
        SERVICE_USER_ACCESS_TOKEN_HEADER,
        CSRF_TOKEN_HEADER,
        DL_COMPONENT_HEADER,
        DL_EMBED_TOKEN_HEADER,
    ],
    headersMap: {},
    requestIdHeaderName: 'x-request-id',
} satisfies Partial<AppConfig>;
