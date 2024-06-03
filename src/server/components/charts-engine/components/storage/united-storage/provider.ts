import type {IncomingHttpHeaders} from 'http';

import type {Request} from '@gravity-ui/expresskit';
import type {AppContext} from '@gravity-ui/nodekit';
import type {AxiosRequestConfig} from 'axios';
import axios from 'axios';
import axiosRetry from 'axios-retry';

import type {EntryPublicAuthor, WorkbookId} from '../../../../../../shared';
import {
    AuthHeader,
    DL_COMPONENT_HEADER,
    DL_CONTEXT_HEADER,
    DL_EMBED_TOKEN_HEADER,
    FORWARDED_FOR_HEADER,
    PROJECT_ID_HEADER,
    SERVICE_USER_ACCESS_TOKEN_HEADER,
    SuperuserHeader,
    TENANT_ID_HEADER,
    TRACE_ID_HEADER,
    US_PUBLIC_API_TOKEN_HEADER,
    WORKBOOK_ID_HEADER,
} from '../../../../../../shared';
import {createErrorHandler} from '../../error-handler';
import {getDuration} from '../../utils';
import type {ResolvedConfig} from '../types';

const handleError = createErrorHandler({
    meta: {
        tags: {
            component: 'storage',
        },
    },
});

axiosRetry(axios, {
    retries: 2,
    retryDelay: (retryCount) => {
        return 50 * retryCount;
    },
});

const ENTRY_NOT_FOUND = 'ENTRY_NOT_FOUND';
const ENTRY_FORBIDDEN = 'ENTRY_FORBIDDEN';
const TEN_SECONDS = 10000;
const PASSED_PROPERTIES: (keyof Entry)[] = [
    'entryId',
    'data',
    'key',
    'links',
    'meta',
    'permissions',
    'scope',
    'type',
    'public',
    'isFavorite',
    'revId',
    'savedId',
    'publishedId',
    'createdAt',
    'createdBy',
    'updatedAt',
    'updatedBy',
    'workbookId',
];

export type Entry = {
    entryId?: string;
    meta?: {
        entryId: string;
        key: string;
        stype?: string;
    };
    key?: string;
    type?: string;
    data?: unknown;
    links?: unknown;
    permissions?: {execute: boolean; read: boolean; edit: boolean; admin: boolean};
    scope?: string;
    public?: false;
    isFavorite?: undefined;
    revId?: string;
    savedId?: string;
    publishedId?: string;
    createdAt?: string;
    createdBy?: string;
    unversionedData?: {
        publicAuthor?: EntryPublicAuthor;
    };
    updatedAt?: string;
    updatedBy?: string;
    workbookId?: WorkbookId;
};

export type EmbeddingInfo = {
    token: EmbeddingToken;
    embed: {
        embedId: string;
        title: string;
        embeddingSecretId: string;
        entryId: string;
        depsIds: string[];
        unsignedParams: string[];
        createdBy: string;
        createdAt: string;
    };
    chart: ResolvedConfig;
};

export type EmbeddingToken = {
    embedId: string;
    iat: number;
    exp: number;
    params: Record<string, unknown>;
};

const PASSED_HEADERS = [
    // Auth for domain
    AuthHeader.Cookie,

    // Auth with OAuth token
    AuthHeader.Authorization,

    // For correct Blackbox-auth on *.yandex.net
    'x-origin-host',

    SuperuserHeader.XDlAllowSuperuser,
    SuperuserHeader.XDlSudo,

    DL_CONTEXT_HEADER,

    US_PUBLIC_API_TOKEN_HEADER,

    FORWARDED_FOR_HEADER,

    TRACE_ID_HEADER,

    // Token for embedded charts
    DL_EMBED_TOKEN_HEADER,

    DL_COMPONENT_HEADER,
];

const DEFAULT_MAX_BODY_LENGTH = 15 * 1024 * 1024; // 100 MB
const DEFAULT_MAX_CONTENT_LENGTH = 15 * 1024 * 1024; // 100 MB

function formatPassedHeaders(
    headers: Request['headers'],
    ctx: AppContext,
    extraAllowedHeaders?: string[],
) {
    const headersNew: Request['headers'] = {};

    const {headersMap} = ctx.config;

    const passedHeaders = [
        ...PASSED_HEADERS,

        headersMap.folderId,
        headersMap.subjectToken,
        PROJECT_ID_HEADER,
        TENANT_ID_HEADER,
        SERVICE_USER_ACCESS_TOKEN_HEADER,
        ...(extraAllowedHeaders || []),
    ];

    if (headers) {
        passedHeaders.forEach((name) => {
            if (headers[name]) {
                headersNew[name] = headers[name];
            }
        });
    }

    return headersNew;
}

function formatPassedProperties(entry: Entry = {}) {
    // These fallbacks are needed to work with some old entities migrated to the US from the conf repository
    const entryId: string | undefined = (entry.meta || {}).entryId || entry.entryId;
    const workbookId: string | null | undefined = entry.workbookId;
    const key: string | undefined = entry.key || (entry.meta || {}).key;
    const type: string | undefined = (entry.meta || {}).stype || entry.type;
    const publicAuthor = entry.unversionedData?.publicAuthor;

    const formattedData: Record<string, unknown> = {};
    PASSED_PROPERTIES.forEach((field) => {
        formattedData[field] = entry[field];
    });

    // It's better not to remove this, a lot of things are tied to this meta format
    const meta = {
        ...entry.meta,
        stype: type,
        owner: entry.createdBy,
    };

    formattedData.entryId = entryId;
    formattedData.workbookId = workbookId;
    formattedData.key = key;
    formattedData.type = type;
    formattedData.meta = meta;

    // unversioned data
    if (publicAuthor) {
        formattedData.publicAuthor = publicAuthor;
    }

    return formattedData as ResolvedConfig;
}

let storageEndpoint: string;

export type ProviderUpdateParams = {
    entryId: string;
    revId?: string;
    data?: unknown;
    type?: unknown;
    mode?: string;
    links?: unknown;
    meta?: Record<string, string>;
    headers: Request['headers'];
    skipSyncLinks?: boolean;
};

export type ProviderCreateParams = {
    key: string;
    data: unknown;
    type: unknown;
    scope: unknown;
    links?: unknown;
    headers: Request['headers'];
    recursion?: boolean;
    meta?: Record<string, string>;
    includePermissionsInfo?: boolean | string;
    workbookId: string;
    name: string;
};

function injectMetadata(headers: IncomingHttpHeaders, ctx: AppContext): IncomingHttpHeaders {
    const metadata = ctx.getMetadata();
    return {...headers, ...metadata};
}

export class USProvider {
    static errors = {
        ENTRY_NOT_FOUND,
    };

    static init({endpoint, requestIdHeaderName}: {endpoint: string; requestIdHeaderName: string}) {
        storageEndpoint = endpoint;

        PASSED_HEADERS.push(requestIdHeaderName);
    }

    static retrieveById(
        ctx: AppContext,
        {
            id,
            revId,
            unreleased,
            includeLinks,
            includePermissionsInfo,
            headers,
            storageApiPath,
            extraAllowedHeaders,
            workbookId,
        }: {
            id: string;
            storageApiPath?: string;
            extraAllowedHeaders?: string[];
            unreleased: boolean | string;
            includeLinks?: boolean | string;
            includePermissionsInfo?: boolean | string;
            revId?: string;
            headers: Request['headers'];
            workbookId?: WorkbookId;
        },
    ) {
        const hrStart = process.hrtime();

        const params: {
            branch: 'saved' | 'published';
            includeLinks?: boolean;
            includePermissionsInfo?: boolean;
            revId?: string;
        } = {
            branch: unreleased ? 'saved' : 'published',
        };

        if (includeLinks) {
            params.includeLinks = true;
        }

        if (includePermissionsInfo) {
            params.includePermissionsInfo = true;
        }

        if (revId) {
            params.revId = revId;
        }
        const formattedHeaders = formatPassedHeaders(headers, ctx, extraAllowedHeaders);

        if (workbookId) {
            formattedHeaders[WORKBOOK_ID_HEADER] = workbookId;
        }

        const axiosArgs: AxiosRequestConfig = {
            url: storageApiPath
                ? `${storageEndpoint}${storageApiPath}/${id}`
                : `${storageEndpoint}/v1/entries/${id}`,
            method: 'get',
            headers: injectMetadata(formattedHeaders, ctx),
            params,
            timeout: TEN_SECONDS,
        };

        return axios
            .request(axiosArgs)
            .then((response) => {
                ctx.log('UNITED_STORAGE_CONFIG_LOADED', {duration: getDuration(hrStart)});

                return formatPassedProperties(response.data);
            })
            .catch((error) => {
                if (error.response && error.response.status === 404) {
                    error.description = id;
                    error.code = ENTRY_NOT_FOUND;
                    error.status = 404;
                    throw error;
                } else if (error.response && error.response.status === 403) {
                    error.description = id;
                    error.code = ENTRY_FORBIDDEN;
                    error.status = 403;
                    throw error;
                } else {
                    throw handleError({
                        code: 'UNITED_STORAGE_OBJECT_RETRIEVE_ERROR',
                        meta: {extra: {id}},
                        error,
                        rethrow: false,
                    });
                }
            });
    }

    static retrieveByKey(
        ctx: AppContext,
        {
            key,
            unreleased,
            includeLinks,
            includePermissionsInfo,
            headers,
        }: {
            key: string;
            unreleased: boolean | string;
            includeLinks?: boolean | string;
            includePermissionsInfo?: boolean | string;
            headers: Request['headers'];
        },
    ) {
        const hrStart = process.hrtime();

        const params: {
            key: string;
            branch: 'saved' | 'published';
            includeLinks?: boolean;
            includePermissionsInfo?: boolean;
        } = {
            key: key.replace(/^\//, ''),
            branch: unreleased ? 'saved' : 'published',
        };

        if (includeLinks) {
            params.includeLinks = true;
        }

        if (includePermissionsInfo) {
            params.includePermissionsInfo = true;
        }

        const formattedHeaders = formatPassedHeaders(headers, ctx);
        const axiosArgs: AxiosRequestConfig = {
            url: `${storageEndpoint}/v1/entriesByKey`,
            method: 'get',
            headers: injectMetadata(formattedHeaders, ctx),
            params,
            timeout: TEN_SECONDS,
        };

        return axios
            .request(axiosArgs)
            .then((response) => {
                ctx.log('UNITED_STORAGE_CONFIG_LOADED', {duration: getDuration(hrStart)});

                return formatPassedProperties(response.data);
            })
            .catch((error) => {
                if (error.response && error.response.status === 404) {
                    error.description = key;
                    error.code = ENTRY_NOT_FOUND;
                    error.status = 404;
                    throw error;
                } else if (error.response && error.response.status === 403) {
                    error.description = key;
                    error.code = ENTRY_FORBIDDEN;
                    error.status = 403;
                    throw error;
                } else {
                    throw handleError({
                        code: 'UNITED_STORAGE_OBJECT_RETRIEVE_ERROR',
                        meta: {extra: {key}},
                        error,
                        rethrow: false,
                    });
                }
            });
    }

    static retrieveByToken(
        ctx: AppContext,
        {
            token,
            headers,
        }: {
            token: string;
            headers: Request['headers'];
        },
    ): Promise<EmbeddingInfo> {
        const hrStart = process.hrtime();
        const headersWithToken = {
            ...headers,
            [DL_EMBED_TOKEN_HEADER]: token,
        };
        const formattedHeaders = formatPassedHeaders(headersWithToken, ctx);
        const axiosArgs: AxiosRequestConfig = {
            url: `${storageEndpoint}/v1/embedded-chart/`,
            method: 'get',
            headers: injectMetadata(formattedHeaders, ctx),
            timeout: TEN_SECONDS,
        };

        return axios
            .request(axiosArgs)
            .then((response) => {
                ctx.log('UNITED_STORAGE_CONFIG_LOADED', {duration: getDuration(hrStart)});

                return {
                    token: response.data.token,
                    embed: response.data.embed,
                    chart: formatPassedProperties(response.data.chart),
                };
            })
            .catch((error) => {
                if (error.response && error.response.status === 404) {
                    error.description = 'embedToken';
                    error.code = ENTRY_NOT_FOUND;
                    error.status = 404;
                    throw error;
                } else if (error.response && error.response.status === 403) {
                    error.description = 'embedToken';
                    error.code = ENTRY_FORBIDDEN;
                    error.status = 403;
                    throw error;
                } else {
                    throw handleError({
                        code: 'UNITED_STORAGE_OBJECT_RETRIEVE_ERROR',
                        meta: {extra: {type: 'embedToken'}},
                        error,
                        rethrow: false,
                    });
                }
            });
    }

    static create(
        ctx: AppContext,
        {
            key,
            data,
            type,
            scope,
            links,
            headers,
            recursion = true,
            meta = {},
            includePermissionsInfo,
            workbookId,
            name,
        }: ProviderCreateParams,
    ) {
        const hrStart = process.hrtime();

        const postedData: {
            key: string;
            data: unknown;
            scope: unknown;
            type: unknown;
            recursion: boolean;
            links?: unknown;
            meta: Record<string, string>;
            workbookId: string;
            name: string;
            includePermissionsInfo?: boolean;
        } = {
            key,
            data,
            scope,
            type,
            recursion,
            meta,
            workbookId,
            name,
        };

        if (links) {
            postedData.links = links;
        }

        if (includePermissionsInfo) {
            postedData.includePermissionsInfo = true;
        }
        const formattedHeaders = formatPassedHeaders(headers, ctx);
        const axiosArgs: AxiosRequestConfig = {
            url: `${storageEndpoint}/v1/entries`,
            method: 'post',
            headers: injectMetadata(formattedHeaders, ctx),
            data: postedData,
            timeout: TEN_SECONDS,
            maxBodyLength: DEFAULT_MAX_BODY_LENGTH,
            maxContentLength: DEFAULT_MAX_CONTENT_LENGTH,
        };

        return axios
            .request(axiosArgs)
            .then((response) => {
                ctx.log('UNITED_STORAGE_OBJECT_CREATED', {duration: getDuration(hrStart)});

                return formatPassedProperties(response.data);
            })
            .catch((error) => {
                if (error.response && error.response.status === 404) {
                    error.code = ENTRY_NOT_FOUND;
                    error.status = 404;
                    throw error;
                } else if (error.response && error.response.status === 403) {
                    error.code = ENTRY_FORBIDDEN;
                    error.status = 403;
                    throw error;
                } else {
                    throw handleError({
                        code: 'UNITED_STORAGE_OBJECT_CREATE_ERROR',
                        meta: {extra: {key}},
                        error,
                        rethrow: false,
                    });
                }
            });
    }

    static update(
        ctx: AppContext,
        {
            entryId,
            revId,
            data,
            type,
            mode = 'save',
            links,
            meta = {},
            headers,
            skipSyncLinks,
        }: ProviderUpdateParams,
    ) {
        const hrStart = process.hrtime();

        const postedData: {
            mode: string;
            meta: Record<string, string>;
            revId?: string;
            data?: unknown;
            type?: unknown;
            links?: unknown;
            skipSyncLinks?: boolean;
        } = {
            mode,
            meta,
        };

        if (revId) {
            postedData.revId = revId;
        }

        if (data) {
            postedData.data = data;
        }

        if (type) {
            postedData.type = type;
        }

        if (links) {
            postedData.links = links;
        }
        if (skipSyncLinks) {
            postedData.skipSyncLinks = true;
        }
        const formattedHeaders = formatPassedHeaders(headers, ctx);
        const axiosArgs: AxiosRequestConfig = {
            url: `${storageEndpoint}/v1/entries/${entryId}`,
            method: 'post',
            headers: injectMetadata(formattedHeaders, ctx),
            data: postedData,
            timeout: TEN_SECONDS,
            maxBodyLength: DEFAULT_MAX_BODY_LENGTH,
            maxContentLength: DEFAULT_MAX_CONTENT_LENGTH,
        };

        return axios
            .request(axiosArgs)
            .then((response) => {
                ctx.log('UNITED_STORAGE_OBJECT_UPDATED', {duration: getDuration(hrStart)});

                return formatPassedProperties(response.data);
            })
            .catch((error) => {
                if (error.response && error.response.status === 404) {
                    error.code = ENTRY_NOT_FOUND;
                    error.status = 404;
                    throw error;
                } else if (error.response && error.response.status === 403) {
                    error.code = ENTRY_FORBIDDEN;
                    error.status = 403;
                    throw error;
                } else {
                    throw handleError({
                        code: 'UNITED_STORAGE_OBJECT_UPDATE_ERROR',
                        meta: {extra: {entryId}},
                        error,
                        rethrow: false,
                    });
                }
            });
    }

    static delete(
        ctx: AppContext,
        {id, headers}: {id: Request['params']['entryId']; headers: Request['headers']},
    ) {
        const hrStart = process.hrtime();
        const formattedHeaders = formatPassedHeaders(headers, ctx);
        const axiosArgs: AxiosRequestConfig = {
            url: `${storageEndpoint}/v1/entries/${id}`,
            method: 'delete',
            headers: injectMetadata(formattedHeaders, ctx),
            timeout: TEN_SECONDS,
        };

        return axios
            .request(axiosArgs)
            .then((response) => {
                ctx.log('UNITED_STORAGE_OBJECT_DELETED', {duration: getDuration(hrStart)});

                return formatPassedProperties(response.data);
            })
            .catch((error) => {
                if (error.response && error.response.status === 404) {
                    error.code = ENTRY_NOT_FOUND;
                    error.status = 404;
                    throw error;
                } else if (error.response && error.response.status === 403) {
                    error.code = ENTRY_FORBIDDEN;
                    error.status = 403;
                    throw error;
                } else {
                    handleError({
                        code: 'UNITED_STORAGE_OBJECT_UPDATE_ERROR',
                        meta: {extra: {id}},
                        error,
                    });
                }
            });
    }
}
